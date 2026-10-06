# ShutterUpskal

EF Ventures branded desktop image upscaler powered by Upscayl. Processing uses the GPU on the user's computer; no EF platform GPU endpoint or automatic remote fallback.

Select a photo or enable Batch mode, choose a model/scale, select a separate output folder, then start upscaling. Inspect output details before sharing. A Vulkan-compatible GPU is required.

Help includes instructions, upstream troubleshooting, corresponding source, and Nexus Direct Messages to find a Core Steward. The link does not preselect a recipient.

The Windows preview workflow produces unsigned installer and ZIP artifacts without publishing a release. Windows GPU acceptance testing is required.

Build with npm ci, npm run tsc, npm run build, and npm run dist:win -- --publish never.

Based on Upscayl by Nayam Amarshe, TGS963 and contributors; independent EF edition with no implied endorsement. AGPL-3.0 retained. LICENSE, Real-ESRGAN_LICENSE.txt and model notices remain. Provide corresponding source with distributed binaries: https://github.com/rlongin/upscayl/tree/efv-shutterupskal.

Settings isolated in EFV-ShutterUpskal. Updates target rlongin/upscayl. Models and processing commands unchanged.
