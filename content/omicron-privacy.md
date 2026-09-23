---
template: page
title: Omicron Privacy Policy
description: "How Omicron handles recordings, transcripts, API keys, local notes, iCloud exports, and Groq processing."
url: /omicron/privacy/
draft: false
---

Last updated: September 23, 2026.

Omicron is an Apple Watch and iPhone app made by Igor Varyvoda. It captures spoken notes on iPhone or Apple Watch, transfers Watch recordings to the paired iPhone, and, with your permission, uses Groq to transcribe and clean them. The developer does not operate an Omicron server and cannot access your recordings, transcripts, notes, or Groq API key.

## Data Omicron handles

- **Recordings.** Audio is recorded only after you start recording on iPhone or Apple Watch. Watch audio is transferred to the paired iPhone. Recordings are kept in Omicron's private app storage. Recordings awaiting your Groq permission remain there until you allow processing or delete the note. Audio from successfully processed notes is deleted after seven days. Audio from failed work remains until you retry or delete the note.
- **Transcripts and notes.** Raw transcripts and cleaned notes are stored locally on your iPhone. If iCloud Drive is available, Omicron also exports Markdown files to your own `iCloud Drive/Omicron` folder.
- **Groq API key.** You provide your own Groq API key. Omicron stores it in the iPhone Keychain with device-only accessibility. It is not synced, logged, sent to Apple Watch, or shared with the developer.
- **Diagnostics and analytics.** Omicron includes no advertising, tracking, analytics, or developer-operated telemetry.

## Groq processing

Omicron asks for your explicit permission before sending data to Groq, LLC, a third-party AI provider. If you allow it, Omicron sends each voice recording to Groq for transcription and sends the resulting raw transcript to Groq for AI cleanup. This includes recordings saved before you allowed processing. Spoken content can include personal information about you or other people. Requests go directly from your iPhone to Groq using your Groq account and API key. The developer does not receive these requests.

Groq says it always keeps usage metadata that does not contain customer inputs or outputs. It may retain inference inputs and outputs for up to 30 days for system reliability and abuse monitoring, or longer if legally required. You can enable Zero Data Retention in your Groq account. Groq stores retained customer data in the United States. Groq's [Cloud Services data processing terms](https://console.groq.com/docs/legal/customer-data-processing-addendum) require purpose limits, confidentiality, and security controls for customer data, providing protection equal to that described here for the data Omicron shares. See [Groq's current data practices](https://console.groq.com/docs/your-data) and [Cloud Services data processing terms](https://console.groq.com/docs/legal/customer-data-processing-addendum).

## Your choices and deletion

You can withdraw permission at any time with **Stop sending data to Groq** in Omicron Settings. This stops future requests while keeping your API key and local notes. Removing the API key also revokes permission. Requests already sent remain subject to your Groq account's data controls. You can delete individual notes in the app; Omicron then deletes its local note, retained audio, and managed Markdown export. Deleting the app removes its local data. You can manage Groq retention controls and account data in your Groq account. Files already exported to iCloud are also governed by your Apple account and iCloud settings.

## Contact

Questions or deletion requests concerning data controlled by the developer can be sent through the [contact page](/contact/). Omicron does not hold server-side user data for the developer to delete.
