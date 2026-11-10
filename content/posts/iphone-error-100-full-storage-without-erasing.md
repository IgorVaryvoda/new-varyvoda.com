---
title: "Fix iPhone update error 100 (06A6.0064) without erasing your data"
date: 2026-11-10
draft: false
content_type: "Guide"
description: "\"The iPhone could not be updated. An unknown error occurred (100)\" on a nearly full iPhone stuck in Recovery Mode after an iOS update. How I finished the update on a friend's phone with no backup and kept all the data."
featuredImage: "/images/posts/iphone-error-100-full-storage-without-erasing.webp"
image_alt: "A small wooden boat with a glowing amber lantern waits at closed canal lock gates on a misty night, a line of light in the gap, cleared rubble and a shovel on the quay."
ogImage: "https://www.varyvoda.com/images/posts/iphone-error-100-full-storage-without-erasing.jpg"
---

The iOS 27.2.1 update left a friend's iPhone 12 Pro Max on the cable-and-computer screen, nearly full and with no backup. Finder's Update failed with this, then offered only an erase:

> The iPhone "iPhone" could not be updated. An unknown error occurred (100). 06A6.0064

The phone is back on 27.2.1 with all its data. Here is the fix first, then how we got there.

## The fix

The phone has enough space. Apple's updater checks the space, decides it's fine and skips its own low-space cleanup. Then one large reservation fails.

[Senne's patch](https://github.com/3SENN/iphone-stuck-in-recovery-full-storage) for [idevicerestore](https://github.com/libimobiledevice/idevicerestore) tells the phone the system image is a little bigger than it is. The space check fails, the phone cleans up, and the real image fits. It installs a normal Apple-signed update. Nothing is jailbroken and nothing is erased.

It applies only if Finder's log has this line:

```sh
grep -n 'Failed preallocation due to space' ~/Library/Logs/iPhone\ Updater\ Logs/*.log
```

## Prompt for your AI agent

I did this with Claude Code on a Mac. If you use a coding agent, paste this:

```text
My iPhone is stuck in Recovery Mode after an iOS update failed in Finder with
"The iPhone could not be updated. An unknown error occurred (100)" (06A6.0064).
It is connected to this Mac by USB. There is no backup, so the data must survive.

Rules:
- Never erase the phone. Never press Restore in Finder. Never pass -e or
  --erase to idevicerestore.
- Before any step that touches the phone, tell me what it does and what
  happens if it fails.
- Read the patch before you build it.

Steps:
1. Read ~/Library/Logs/iPhone Updater Logs/ and confirm the failure is
   "Failed preallocation due to space" for /mnt9/cryptex1/current/os.dmg at
   install_splat. If it is not, stop. This fix does not apply.
2. From the last attempt in that log, take N from
   "Size of Cryptex1,SystemOS is N MB" and A and B from
   "SpaceNeededForRestore: A MB ContainerFreeSpace: B MB".
   Compute VALUE = N + (B - A) + 150.
3. Follow https://github.com/3SENN/iphone-stuck-in-recovery-full-storage:
   build idevicerestore at the pinned commit with its patch.
4. Download the Apple-signed IPSW for my exact model, for the iOS version
   that failed or a newer one. Verify its checksum. Do not save it under
   ~/Library/iTunes.
5. Run idevicerestore --ipsw-info on it and confirm it has a
   "Customer Upgrade Install (IPSW)" identity with Behavior: Update for my
   model.
6. Explain the cleanup risk to me and wait for my OK.
7. Run the update with IDEVICERESTORE_CRYPTEX_SIZE_MIB=VALUE, my ECID and
   --variant 'Customer Upgrade Install (IPSW)'. Check that the output says
   "This restore will update the device without erasing user data".
8. Report when it prints "Status: Restore Finished", or show me the error.
```

## All the steps

1. **Check the phone is in Recovery Mode** and note the model and ECID.

   ```sh
   brew install libirecovery
   irecovery -q | grep -E 'MODE|PRODUCT|ECID'
   ```

2. **Get your numbers from Finder's log.** No log yet? Run Finder's **Update** once (never **Restore**) and let it fail.

   ```sh
   grep -hE 'Size of Cryptex1,SystemOS is|SpaceNeededForRestore' ~/Library/Logs/iPhone\ Updater\ Logs/*.log | tail -2
   ```

3. **Work out the size to declare.** Ours was 5898 + (6869 − 6240) + 150 = 6677.

   ```text
   value = Cryptex size + (ContainerFreeSpace − SpaceNeededForRestore) + 150
   ```

4. **Build the patched tool.** iPhone 14 and newer also need libtatsu built from source; Senne's README has the commands.

   ```sh
   brew install autoconf automake libtool pkgconf libimobiledevice libirecovery libtatsu libzip
   git clone https://github.com/3SENN/iphone-stuck-in-recovery-full-storage.git
   git clone https://github.com/libimobiledevice/idevicerestore.git
   cd idevicerestore
   git checkout 60192e9
   git apply ../iphone-stuck-in-recovery-full-storage/patches/0001-restore-Allow-overriding-the-declared-Cryptex1-SystemOSSize.patch
   ./autogen.sh --prefix="$PWD/install"
   make -j4 && make install
   ```

5. **Download the firmware.** Get the signed IPSW for your exact model from [ipsw.me](https://ipsw.me), for the version that failed or a newer one. Check its SHA-1 against the checksum listed there. Keep it out of `~/Library/iTunes`, because Finder deletes files there.

   ```sh
   shasum -a 1 <firmware.ipsw>
   ```

6. **Confirm the firmware has an update identity** for your model. You want `Behavior: Update`.

   ```sh
   ./install/bin/idevicerestore --ipsw-info <firmware.ipsw>
   ```

7. **Close Finder's iPhone window** and any other restore tool.

8. **Run the update.** No `-e`, ever.

   ```sh
   IDEVICERESTORE_CRYPTEX_SIZE_MIB=<value> caffeinate -is ./install/bin/idevicerestore \
     -y -P -i <ECID> --variant 'Customer Upgrade Install (IPSW)' <firmware.ipsw>
   ```

9. **Check the first lines**, then wait for the last one. Ours took eight and a half minutes.

   ```text
   Variant: Customer Upgrade Install (IPSW)
   This restore will update the device without erasing user data.
   Declaring Cryptex1,SystemOSSize as 6677 MiB (real size 5898 MiB)
   ...
   Status: Restore Finished
   ```

10. **Leave the phone alone while it boots.** Ours showed an Apple logo and "attempting data recovery" for a while. Then unlock it, back it up and free some storage.

## Before you try it

- This is for one specific failure. If your log shows a different error, it won't help.
- Use the iOS version that failed, or a newer one. An older one is refused as a downgrade.
- The fix works by making the phone clean up. Senne's analysis says that cleanup can remove caches, logs and some photo and mail data, most likely only what iOS already marks as purgeable. Nobody has proven exactly what. On this phone all the data survived. It's a much smaller risk than an erase, but it's not zero.
- If the same error comes back, raise the value by 200 and run it again. A failed attempt leaves the phone in Recovery Mode, same as before.
- Check the Mac's free disk first. The firmware file alone was 11.5 GB, and the tool unpacks parts of it while it runs.

## Why it fails

Senne's explanation, which matched the numbers in our log line for line:

1. The phone reserves the whole system image in one request. APFS refuses a single reservation bigger than about 84% of free space. Ours was 5,898 of 6,869 MB, or 86%.
2. The space check before it doesn't know about that limit. It adds up sizes, sees 629 MB to spare and says fine.
3. The low-space cleanup would free the missing room. It only runs when the space check fails. The check passed, so it never ran.

The check and the reservation get the image size from different places. The check uses a number the computer sends. The reservation uses the real image. That's why sending a bigger number works.

By the time the reservation fails, the old system is already deleted. That's why the phone can't boot.

## How it went for us

I plugged the phone into my Mac and asked Claude Code to fix it, carefully.

First the harmless step: `irecovery -n` tells the phone to leave Recovery Mode. It rebooted straight back in.

Next was Finder's **Update**. Claude drove Finder through accessibility scripting with a guard: it read the dialog text and the serial number first, and pressed only a button named exactly "Update". Finder downloaded 11.5 GB, installed for a few minutes and failed with error 100.

The log had the failure in three lines:

```text
Installing Cryptex1,SystemOS -> /mnt9/cryptex1/current/os.dmg
Transfer: Failed preallocation of 6184501248 bytes for /mnt9/cryptex1/current/os.dmg: Unknown error: -1.
Transfer: Failed preallocation due to space. No hope in this succeeding, bailing.
```

A few thousand lines earlier, the same log said the space was fine:

```text
SpaceNeededForRestore: 6240 MB ContainerFreeSpace: 6869 MB
Sufficient space available for upgrade install
```

Claude read that and told me there were two options: erase the phone, or leave it in a drawer and hope a future iOS build is smaller. That was a fair reading of the log and the wrong answer.

I asked ChatGPT for a second opinion, on the GPT Astra 6 Pro model, and it found Senne's repository. Claude then read the 45-line patch and a dozen success reports on the issue tracker. One was an iPhone 12 with exactly the same image size. It built the tool and ran it, and the update finished on the first patched attempt.

Three things went sideways on the way:

- **The other signed build was no help.** iOS 27.2 has the same 5,898 MiB image, and the phone would have refused it as a downgrade anyway.
- **The Mac ran out of disk.** An 11.5 GB firmware file plus 10.9 GB of Finder's temporary files took it to 808 MB free in the middle of a download.
- **Finder deleted the firmware.** A file saved to `~/Library/iTunes/iPhone Software Updates/` was gone four minutes later.

## What Apple could change

Any one of these would prevent it: reserve the image in chunks, include the 84% limit in the space check, or run the cleanup before deleting the old system.

The owner's part is simpler. The phone was 97% full with no backup when it installed the update. A backup and a storage clear-out come before the next one.

Thanks to [Senne](https://github.com/3SENN/iphone-stuck-in-recovery-full-storage) for working this out on their own phone and writing it down.
