# ShutterUpskal — EF Ventures installer landing page

## Scope
- Clicking ShutterUpskal in Ventura OS opens an app detail page, **not** the desktop binary.
- Display existing ShutterUpskal camera icon, EF Ventures branding, description, verified system requirements, version, and Download & Install CTA.
- The CTA must point to a published, verified EF Ventures release asset (never an upstream Upscayl installer or placeholder URL).
- Browser downloads cannot silently run executables. Instruct users to open the downloaded installer and approve Windows prompts.
- After installation, normal Start Menu/Desktop shortcuts launch the desktop application.
- Provide installer checksum and publisher information; don't claim code signing unless verified.

## Visual design
- Deep navy background, translucent glass cards/buttons, pale blue/violet highlights.
- Match Ventura OS visual language, retain existing camera app icon.
- Accessible focus outlines and reduced-motion support.
- Glass effects must remain cosmetic, with no GPU-intensive animations.

## Non-negotiable regression constraints
- Preserve existing Upscayl processing binaries, AI models, batch mode, settings, input/output paths, GPU handling, and file formats.
- Do not publish a release or change Ventura OS production navigation without approval.
- Verify the installer binary, Windows requirements, checksum, and end-to-end download before enabling the CTA.
- Test Windows installer on a clean VM and confirm uninstall, shortcuts, first launch, batch processing, and image output parity.

## Implementation checklist
1. Apply the opt-in CSS from renderer/styles/efv-glass.css to presentation components only.
2. Build Ventura OS detail page in efv-nexus-hub on a separate feature branch.
3. Connect its CTA to the verified release asset.
4. Run regression checks and request review before deployment.
