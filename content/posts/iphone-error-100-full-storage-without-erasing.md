---
title: "Finder said erase the iPhone. A 45-line patch finished the update instead."
date: 2026-11-10
draft: false
content_type: "Guide"
description: "An iOS 27.2.1 update left my iPhone 12 Pro Max in Recovery Mode with error 100 (06A6.0064) and no backup. The phone had the space. Apple's updater just never ran its own cleanup."
featuredImage: "/images/posts/iphone-error-100-full-storage-without-erasing.webp"
image_alt: "A small wooden boat with a glowing amber lantern waits at closed canal lock gates on a misty night, a line of light in the gap, cleared rubble and a shovel on the quay."
ogImage: "https://www.varyvoda.com/images/posts/iphone-error-100-full-storage-without-erasing.jpg"
---

The iOS 27.2.1 update left my iPhone 12 Pro Max on the cable-and-computer screen. I plugged it into the Mac and asked Claude Code to fix it, carefully. It took a morning, one wrong conclusion and a patch written by a stranger. The phone is back, on 27.2.1, with all its data.

If you're here because Finder showed you this, the short version is in [the fix](#the-fix).

> The iPhone "iPhone" could not be updated. An unknown error occurred (100). 06A6.0064

## The safe steps, in order

First the harmless one: tell the phone to leave Recovery Mode and boot.

```sh
brew install libirecovery
irecovery -n
```

It rebooted straight back into recovery. So iOS itself was half-installed.

Next was Finder's **Update**, which reinstalls iOS and keeps your data. **Restore** is the button next to it, and it erases everything. I had no backup on the Mac and none in iCloud, so Claude drove Finder through accessibility scripting with a guard: it read the dialog text and the serial number first, and pressed only a button named exactly "Update".

Finder downloaded 11.5 GB, installed for a few minutes and failed with error 100. Then it changed its offer:

> Your iPhone can't be updated; you must restore it to factory settings.

## What the log says

Finder keeps a full log at `~/Library/Logs/iPhone Updater Logs/iPhoneUpdater.log`. The failure is three lines:

```text
Installing Cryptex1,SystemOS -> /mnt9/cryptex1/current/os.dmg
Transfer: Failed preallocation of 6184501248 bytes for /mnt9/cryptex1/current/os.dmg: Unknown error: -1.
Transfer: Failed preallocation due to space. No hope in this succeeding, bailing.
```

The phone couldn't reserve 5,898 MiB for one of the system images. It had already deleted the old system by then, which is why it couldn't boot. The same step failed twice.

Here's the strange part. A few thousand lines earlier, the phone had checked its space and passed:

```text
Size of Cryptex1,SystemOS is 5898 MB
SpaceNeededForRestore: 6240 MB ContainerFreeSpace: 6869 MB
Sufficient space available for upgrade install
```

It needed 6,240 MB and had 6,869 MB. Then it failed for lack of space.

## The wrong conclusion

Claude read that log and told me there were two options: erase the phone, or leave it in a drawer and hope a future iOS build is smaller. It checked the other signed build, 27.2, by reading only the manifest out of Apple's 11.5 GB file. Same 5,898 MiB image, so no help there.

That was a fair reading of the log and the wrong answer. I asked ChatGPT for a second opinion, on the GPT Astra 6 Pro model, and it found [a repository by Senne](https://github.com/3SENN/iphone-stuck-in-recovery-full-storage) describing this exact failure, with a fix.

## Why it fails

Senne's explanation, which matched my numbers line for line:

1. The phone reserves the whole system image in one request. APFS refuses a single reservation bigger than about 84% of free space. Mine was 5,898 of 6,869 MB, or 86%.
2. The space check before it doesn't know about that limit. It adds up sizes, sees 629 MB to spare and says fine.
3. The phone has a low-space cleanup that would free the missing room. It only runs when the space check fails. The check passed, so it never ran.

The check and the reservation also get the image size from different places. The check uses a number the computer sends. The reservation uses the real image.

So the fix is to send a bigger number. The check fails, the phone cleans up, and the real image then fits.

## The fix

The patch is 45 lines in one file of [idevicerestore](https://github.com/libimobiledevice/idevicerestore). It overrides one declared size, and only when you set an environment variable. Claude read all of it before building anything, along with a dozen success reports on the issue tracker. One was an iPhone 12 with my exact image size.

The value comes from your own log:

```text
declared size = real size + (free − needed) + 150
              = 5898 + (6869 − 6240) + 150
              = 6677
```

Then the run, with the firmware checksum verified against Apple's first:

```sh
IDEVICERESTORE_CRYPTEX_SIZE_MIB=6677 caffeinate -is ./install/bin/idevicerestore \
  -y -P -i <ECID> --variant 'Customer Upgrade Install (IPSW)' iPhone13,4_27.2.1_24B156_Restore.ipsw
```

Two guards matter here. Never pass `-e`, which erases the phone. And pin `--variant` to the upgrade identity, so a mismatch is an error and not a quiet fallback to an erase install. The tool confirms it on startup:

```text
Variant: Customer Upgrade Install (IPSW)
This restore will update the device without erasing user data.
```

Eight and a half minutes later:

```text
Declaring Cryptex1,SystemOSSize as 6677 MiB (real size 5898 MiB)
Done sending Cryptex1,SystemOS
Sealing System Volume (77)
Status: Restore Finished
```

The phone sat on an Apple logo saying it was attempting data recovery for a while, then booted. All my data was still there.

## Things that went sideways

- **The 27.2 detour was doomed twice.** Same image size, and the phone would have refused it as a downgrade anyway, because the failed update had already recorded 27.2.1.
- **The Mac ran out of disk.** An 11.5 GB firmware file plus 10.9 GB of Finder's temporary files took it to 808 MB free in the middle of a download.
- **Finder deletes firmware from its own folder.** A file saved to `~/Library/iTunes/iPhone Software Updates/` was gone four minutes later. Keep yours somewhere else.

## Before you try it

- This is for one specific failure. Check your log for `Failed preallocation due to space` at `install_splat`. If the error is different, this won't help.
- Use the same iOS version that failed, or a newer one. Older is refused.
- The fix works by making the phone clean up. Senne's analysis says that cleanup can remove caches, logs and some photo and mail data, most likely only what iOS already marks as purgeable. Nobody has proven exactly what. It's a much smaller risk than an erase, but it's not zero.
- A failed attempt leaves the phone in Recovery Mode, same as before.

## What I'd change

Apple could fix this three ways: reserve the image in chunks, include the 84% limit in the space check, or run the cleanup before deleting the old system. Any one would do.

My part is simpler. The phone was 97% full with no backup, and I let it install an update that way. A backup and a storage clear-out come before the next one.

Thanks to [Senne](https://github.com/3SENN/iphone-stuck-in-recovery-full-storage) for working this out on their own phone and writing it down.
