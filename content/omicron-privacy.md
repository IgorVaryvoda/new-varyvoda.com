---
template: page
title: Omicron Privacy Policy
description: "How Omicron handles recordings, transcripts, API keys, local notes, iCloud exports, and Groq processing."
url: /omicron/privacy/
draft: false
---

Last updated: September 2, 2026.

Omicron is an Apple Watch and iPhone app made by Igor Varyvoda. It captures spoken notes on Apple Watch, transfers them to the paired iPhone, and uses Groq to transcribe and clean them. The developer does not operate an Omicron server and cannot access your recordings, transcripts, notes, or Groq API key.

## Data Omicron handles

- **Recordings.** Audio is recorded only after you start recording on Apple Watch. It is transferred to the paired iPhone and kept in Omicron's private app storage. Audio from successfully processed notes is deleted after seven days. Audio from failed work remains until you retry or delete the note.
- **Transcripts and notes.** Raw transcripts and cleaned notes are stored locally on your iPhone. If iCloud Drive is available, Omicron also exports Markdown files to your own `iCloud Drive/Omicron` folder.
- **Groq API key.** You provide your own Groq API key. Omicron stores it in the iPhone Keychain with device-only accessibility. It is not synced, logged, sent to Apple Watch, or shared with the developer.
- **Diagnostics and analytics.** Omicron includes no advertising, tracking, analytics, or developer-operated telemetry.

## Groq processing

Omicron asks for your explicit permission before sending data to Groq. When permission is enabled, it sends each recording to Groq for transcription, then sends the transcript to Groq for cleanup. These requests use your Groq account and API key.

Groq says it always keeps usage metadata that does not contain customer inputs or outputs. It may retain inference inputs and outputs for up to 30 days for system reliability and abuse monitoring, unless Zero Data Retention is enabled in your Groq account. Groq stores retained customer data in the United States. See [Groq's current data practices](https://console.groq.com/docs/your-data) and [privacy policy](https://groq.com/privacy-policy/).

## Your choices and deletion

You can stop Groq processing by removing the API key in Omicron Settings. This also revokes Omicron's data-sharing permission. You can delete individual notes in the app; Omicron then deletes its local note, retained audio, and managed Markdown export. Deleting the app removes its local data. You can manage Groq retention controls and account data in your Groq account. Files already exported to iCloud are also governed by your Apple account and iCloud settings.

## Contact

Questions or deletion requests concerning data controlled by the developer can be sent through the [contact page](/contact/). Omicron does not hold server-side user data for the developer to delete.
