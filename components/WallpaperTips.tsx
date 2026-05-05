"use client";
import { useState, useEffect } from "react";

const TIPS = [
  // iPhone tips
  { text: "iPhone: Turn off iCloud Photo Sync to save significant battery — Settings > [Your Name] > iCloud > Photos > toggle off." },
  { text: "iPhone: Enable Low Power Mode before it hits 20% — Settings > Battery > Low Power Mode. Adds hours." },
  { text: "iPhone: Background App Refresh drains battery silently — Settings > General > Background App Refresh > Off." },
  { text: "iPhone: Set Auto-Lock to 30 seconds — Settings > Display & Brightness > Auto-Lock. Screen-on time is your biggest battery drain." },
  { text: "iPhone: Developer mode is hidden in Settings > Privacy & Security > Developer Mode. Useful for testing apps and USB debugging." },
  { text: "iPhone: Enable Reduce Motion — Settings > Accessibility > Motion > Reduce Motion. Smoother feel, less GPU work." },
  { text: "iPhone: Triple-tap the home button to invert colors for a true dark experience on older non-OLED models." },
  { text: "iPhone: Use Focus modes to silence notifications by context — work, sleep, and driving can each have custom rules." },
  { text: "iPhone: Swipe down on the home screen to search anything — apps, contacts, web, settings. Faster than browsing folders." },
  { text: "iPhone: Hold any app icon and tap Edit Home Screen — then drag apps into folders or off the screen to declutter." },
  { text: "iPhone: Settings > Accessibility > Display & Text Size > Reduce White Point. Dims the screen beyond the minimum brightness slider." },
  { text: "iPhone: Airplane mode + Wi-Fi on = no cellular radio drain but you keep internet. Perfect for weak signal areas." },
  { text: "iPhone: Go to Settings > Privacy > Location Services and audit every app. Most don't need Always On — change to While Using." },
  { text: "iPhone: Offload unused apps automatically — Settings > App Store > Offload Unused Apps. Frees storage without losing data." },
  { text: "iPhone: Settings > Sounds & Haptics > turn off System Haptics to save a small but real amount of battery over a day." },
  { text: "iPhone: Type faster by enabling the one-handed keyboard — hold the globe icon on the keyboard and pick a side." },
  { text: "iPhone: You can scan documents with the Camera app directly — point at any document and it auto-detects the edges." },
  { text: "iPhone: Hold the space bar to turn the keyboard into a trackpad for precise cursor placement." },
  { text: "iPhone: Settings > General > iPhone Storage shows exactly what's eating your space, with smart recommendations." },
  { text: "iPhone: Turn off Significant Locations — Settings > Privacy > Location Services > System Services > Significant Locations." },

  // Android tips
  { text: "Android: Enable Developer Options by tapping Build Number 7 times — Settings > About Phone > Build Number." },
  { text: "Android: In Developer Options, set Window Animation Scale, Transition Animation Scale, and Animator Duration Scale all to 0.5x — your phone will feel twice as fast." },
  { text: "Android: USB Debugging in Developer Options lets you run ADB commands from a PC — sideload apps, take screenshots, backup data without cloud." },
  { text: "Android: Developer Options > Limit background processes — set to 4 or fewer to reclaim RAM on older phones." },
  { text: "Android: Turn off NFC if you don't use contactless payments — it runs constantly and wastes power." },
  { text: "Android: Adaptive Battery learns which apps you actually use and restricts background power for the rest — enable it in Battery settings." },
  { text: "Android: Use ADB to uninstall bloatware that the UI won't let you remove — adb shell pm uninstall -k --user 0 [package]." },
  { text: "Android: Enable Dark Theme system-wide — Settings > Display > Dark Theme. Every supported app follows it automatically." },
  { text: "Android: AMOLED screens use zero power to display true black pixels. A black wallpaper on an OLED phone visibly extends battery." },
  { text: "Android: Go to Settings > Battery > Battery Usage and sort by background usage — find and restrict the silent battery killers." },
  { text: "Android: Sideload APKs safely by enabling Install Unknown Apps only for the specific file manager you're using, then disabling it after." },
  { text: "Android: Use ADB Wireless debugging over Wi-Fi — no cable needed. Enable in Developer Options > Wireless Debugging." },
  { text: "Android: Scoped Storage means apps can only access their own folders by default — check which apps have broad storage access in Permissions." },
  { text: "Android: Enable Heads-Up Notifications only for the apps that actually matter — others can go to the shade silently." },
  { text: "Android: Hold any notification to see which app sent it — then adjust that app's notification settings immediately without opening Settings." },
  { text: "Android: Use split-screen by holding the Recent Apps button and choosing Split Screen — great for reading while messaging." },
  { text: "Android: Digital Wellbeing > Dashboard shows your exact screen time per app. Genuinely alarming and useful." },
  { text: "Android: Set a PIN to Secure Folder on Samsung and put sensitive apps inside it — hidden from the main app drawer." },
  { text: "Android: Google's Find My Device works even when the phone is off, if it has battery — it broadcasts Bluetooth to nearby Android devices." },
  { text: "Android: Use Tasker or MacroDroid to automate tasks — turn off Wi-Fi at night, set volume by location, anything." },

  // Mac tips
  { text: "Mac: Hold Option while clicking the Wi-Fi icon to see your IP address, router, signal strength, and channel without opening System Settings." },
  { text: "Mac: Cmd + Space opens Spotlight — type math directly to calculate. 15% of 340, convert units, open apps, all from one bar." },
  { text: "Mac: Hold Option while dragging any window corner to resize from center. Hold Shift to maintain aspect ratio." },
  { text: "Mac: Terminal — defaults write com.apple.finder AppleShowAllFiles YES — shows hidden files in Finder including .DS_Store and dotfiles." },
  { text: "Mac: Cmd + Shift + 5 opens the screenshot toolbar with screen recording options. Cmd + Shift + 4 then Space clicks to capture a specific window." },
  { text: "Mac: Activity Monitor > Energy tab shows which apps are wrecking your battery. Sort by Energy Impact." },
  { text: "Mac: Disable Spotlight indexing for external drives — System Settings > Siri & Spotlight > Search results > Privacy tab." },
  { text: "Mac: Three-finger swipe up shows Mission Control — all open windows spread out. Three fingers left/right switches desktops." },
  { text: "Mac: Automator can batch rename files, resize images, and convert formats without any code — it ships on every Mac." },
  { text: "Mac: TextEdit in plain text mode is the fastest scratchpad on the planet — Cmd + Shift + T toggles rich text off." },
  { text: "Mac: Quick Look (Space bar on any file in Finder) previews almost any file type without opening an app." },
  { text: "Mac: Add any folder to the Dock sidebar by dragging it next to the Trash. Right-click it to show as Fan or Grid." },
  { text: "Mac: Use Cmd + ` to cycle between windows of the same app. Cmd + Tab cycles apps, Cmd + ` cycles within." },
  { text: "Mac: System Settings > Battery > Options — uncheck Enable Power Nap to stop background syncing on battery." },
  { text: "Mac: AirDrop works between Macs and iPhones — drag files directly to a contact's icon. No app, no setup." },
  { text: "Mac: Cmd + Option + D hides and shows the Dock without going into System Settings every time." },
  { text: "Mac: Use Time Machine with an external SSD — it's faster and more reliable than HDDs and snapshots hourly." },
  { text: "Mac: Hold Option on the volume keys to jump directly to Sound preferences." },
  { text: "Mac: Cmd + Option + Esc force-quits any frozen app immediately — same as Task Manager on Windows." },
  { text: "Mac: Turn off iCloud Drive Desktop & Documents sync if you have a small SSD — it moves everything to the cloud and makes offline work painful." },

  // Windows tips
  { text: "Windows: Win + V opens clipboard history — stores everything you've copied in your current session." },
  { text: "Windows: Win + Shift + S takes a precise screenshot of any region and copies it to clipboard." },
  { text: "Windows: Task Manager > Startup Apps tab — disable everything you don't need starting with Windows. Boot time drops significantly." },
  { text: "Windows: God Mode folder: create a folder named GodMode.{ED7BA470-8E54-465E-825C-99712043E01C} on your desktop — access every control panel setting in one place." },
  { text: "Windows: Settings > System > Power > Power Mode — set to Best Efficiency on laptops when not plugged in." },
  { text: "Windows: Win + X > Terminal (Admin) opens an elevated PowerShell immediately — no Start menu digging." },
  { text: "Windows: winget is Windows' built-in package manager — winget install [app] installs software from the command line without a browser." },
  { text: "Windows: Alt + F4 on the desktop opens the Shut Down dialog — fastest way to restart or shut down without a mouse." },
  { text: "Windows: Settings > Privacy > Diagnostics & Feedback — disable Improve Inking and Typing to stop sending typing data to Microsoft." },
  { text: "Windows: Ctrl + Shift + Esc opens Task Manager directly — faster than Ctrl + Alt + Del then clicking." },
  { text: "Windows: Virtual desktops let you separate work and personal — Win + Ctrl + D creates a new one, Win + Ctrl + Arrows switches." },
  { text: "Windows: Disable Search Indexing on HDDs to improve performance — Services > Windows Search > Startup Type: Disabled." },
  { text: "Windows: WSL2 (Windows Subsystem for Linux) gives you a real Linux terminal inside Windows — enables most Linux tools and scripts natively." },
  { text: "Windows: Device Manager > View > Show Hidden Devices reveals ghost drivers from old hardware — uninstall them to clean up the system." },

  // Linux tips
  { text: "Linux: alias ll='ls -lah' in your .bashrc or .zshrc — adds a useful detailed file listing shortcut permanently." },
  { text: "Linux: Ctrl + R in terminal searches your command history interactively — type any part of a past command and it appears." },
  { text: "Linux: htop is a better top — shows CPU, memory, and processes in color with mouse support. Install with your package manager." },
  { text: "Linux: rsync -avh --progress source/ dest/ is the safest way to copy or back up files — resumes if interrupted." },
  { text: "Linux: screen or tmux keeps sessions running after you disconnect SSH — no lost work when your connection drops." },
  { text: "Linux: Find files modified in the last 24 hours: find / -mtime -1 -type f — useful for tracking what changed after an install." },
  { text: "Linux: journalctl -f follows system logs in real time — like tail -f but for all system services at once." },
  { text: "Linux: chmod 700 ~/.ssh and chmod 600 ~/.ssh/authorized_keys — SSH will refuse to work if your key files are too permissive." },
  { text: "Linux: Use cron for scheduled tasks — crontab -e opens the editor. 0 3 * * * runs a command at 3am every day." },
  { text: "Linux: df -h shows disk space in human-readable format. du -sh * in a directory shows what's using the most space." },
  { text: "Linux: Disable swap on SSDs to extend their lifespan — modern systems with 16GB+ RAM rarely need it." },
  { text: "Linux: grep -r 'search term' /path searches recursively through all files in a directory — add --include='*.log' to filter by type." },
  { text: "Linux: lsof -i :8080 shows which process is using port 8080 — useful when a server won't start." },
  { text: "Linux: Ctrl + Z suspends a process, then bg sends it to background. fg brings it back. Useful for long-running commands." },

  // PC / Hardware tips
  { text: "PC: Reapply thermal paste every 3-5 years on a desktop CPU. Dried paste causes throttling and higher temps silently." },
  { text: "PC: Enable XMP or EXPO in BIOS to run your RAM at its advertised speed — most systems ship with it disabled and run RAM slower by default." },
  { text: "PC: Set your GPU fans to a custom curve in MSI Afterburner — default curves are conservative and let cards run hotter than necessary." },
  { text: "PC: SSD health check with CrystalDiskInfo is free and takes 10 seconds. Run it on any drive over 3 years old." },
  { text: "PC: BIOS > disable unused ports (serial, legacy USB) to marginally reduce power draw and attack surface." },
  { text: "PC: A UPS (Uninterruptible Power Supply) protects against data corruption from sudden power loss — essential for desktops with spinning drives." },
  { text: "PC: Clean your PC case filters every 3-6 months. Dust buildup raises temps by 5-15 degrees over time." },
  { text: "PC: PCIe 4.0 and 5.0 SSDs run hot. Add a heatsink if your motherboard didn't include one — throttling is silent and kills performance." },
  { text: "PC: Monitor your CPU and GPU temps with HWiNFO64 while gaming. If you're hitting 90C+ consistently, something is wrong." },
  { text: "PC: 1080p at 144Hz is more impactful for gaming smoothness than 4K at 60Hz in most fast-paced games." },

  // Gaming tips
  { text: "Gaming: V-Sync introduces input lag. Use G-Sync or FreeSync instead — smoother and more responsive than hard V-Sync." },
  { text: "Gaming: Lower your mouse DPI and raise in-game sensitivity — lower DPI has less input noise and more precise tracking." },
  { text: "Gaming: Discord overlay adds measurable frame time — disable it in games where every millisecond counts." },
  { text: "Gaming: Cap your frame rate to just below your monitor's refresh rate to avoid frame pacing issues without full V-Sync lag." },
  { text: "Gaming: Use wired internet for competitive gaming. Even a good Wi-Fi connection has more jitter than a cable." },
  { text: "Gaming: Enable Game Mode in Windows — it prioritizes CPU resources to the foreground game and suppresses Windows Update restarts." },
  { text: "Gaming: Controller drift is usually fixable with compressed air around the thumbstick base before replacing the whole unit." },
  { text: "Gaming: Most horror games are designed to be played with headphones — stereo separation is how directional sound cues work." },
  { text: "Gaming: Save often and in multiple slots — autosave is not always on, and some horror games delete saves as a mechanic." },
  { text: "Gaming: Reduce monitor brightness and increase contrast for horror games — it widens the visible dark range and makes shadows scarier." },
  { text: "Gaming: Pause a horror game and come back — fear diminishes with time pressure but returns when you resume." },

  // Browser tips
  { text: "Browser: Ctrl + Shift + T reopens the last closed tab in every major browser — works across multiple closed tabs." },
  { text: "Browser: Right-click on the back button to see your full navigation history for that tab — not just one step back." },
  { text: "Browser: Pin frequently used tabs — right-click > Pin Tab. Pinned tabs survive accidental closings and use less space." },
  { text: "Browser: Incognito mode doesn't make you anonymous — your ISP and websites still see your traffic. Use a VPN or Tor for real privacy." },
  { text: "Browser: Most browsers let you mute individual tabs — right-click any tab with a sound icon and select Mute." },
  { text: "Browser: chrome://flags (or about:config in Firefox) unlocks experimental features including performance tweaks not in normal settings." },
  { text: "Browser: Reader Mode strips ads and clutter from articles — available in Firefox, Safari, and Edge. Often reveals the full article behind soft paywalls." },

  // Fear & phobia tips (relevant to the site)
  { text: "Fear: Horror media is a safe way to practice fear response — your brain learns to process threat signals without real danger." },
  { text: "Fear: The Uncanny Valley explains why slightly-wrong human faces trigger deep unease — it's an evolutionary proximity alarm." },
  { text: "Fear: Trypophobia (fear of clustered holes) is not officially classified as a phobia — but it triggers a disgust response in about 16% of people." },
  { text: "Fear: Darkness fear (nyctophobia) is among the most common in adults — it's a survival instinct, not a weakness." },
  { text: "Fear: Horror films increase heart rate, adrenaline, and dopamine simultaneously — the rush is physiologically similar to a mild roller coaster." },
  { text: "Fear: Jump scares work because they exploit the startle reflex — an ancient brainstem response that bypasses conscious processing entirely." },
  { text: "Fear: Atmospheric dread in horror is more effective than gore for most people — sustained tension activates more of the fear network." },
  { text: "Fear: Watching horror with others reduces the perceived intensity — shared arousal is interpreted as belonging rather than threat." },
  { text: "Fear: The most universally feared images involve spiders, snakes, heights, and darkness — all survival-relevant threats from prehistory." },
  { text: "Fear: Your brain cannot distinguish a vivid nightmare from a memory during recall — which is why horror imagery can feel so persistent." },
  { text: "Fear: Exposure therapy for phobias works — repeated low-stakes exposure to the feared stimulus gradually reduces the fear response." },
  { text: "Fear: Sound design causes 50% of the horror reaction in films — mute a scary movie and it becomes far less frightening." },
  { text: "Fear: Humans are uniquely drawn to horror as entertainment — no other species seeks out fictional fear for pleasure." },
  { text: "Fear: The most effective horror uses suggestion over revelation — what you don't see is almost always scarier than what you do." },
  { text: "Fear: Coulrophobia (fear of clowns) intensified after the 1990 IT broadcast — media can create and spread phobias culturally." },
  { text: "Fear: Red and deep shadow in horror art trigger the limbic system more strongly than other color combinations." },

  // General life / productivity tips
  { text: "Tip: The 20-20-20 rule reduces eye strain — every 20 minutes, look at something 20 feet away for 20 seconds." },
  { text: "Tip: Night mode on screens reduces blue light — but the bigger benefit is dimming brightness, not the color temperature shift." },
  { text: "Tip: A password manager means you only need to remember one strong password. Everything else can be random and unique." },
  { text: "Tip: Two-factor authentication via an authenticator app is significantly more secure than SMS codes — SIM swaps can intercept texts." },
  { text: "Tip: Keyboard shortcuts are worth learning — even five shortcuts used 10 times a day saves you hours over a year." },
  { text: "Tip: Most electronics fail in the first month or last year of their life — the middle period is safe and reliable." },
  { text: "Tip: Dark themes don't save battery on LCD screens — only on OLED and AMOLED displays where black pixels are off." },
  { text: "Tip: Cable management isn't just aesthetic — tangled cables trap heat and physically stress connectors over time." },
  { text: "Tip: Restart your router monthly — it clears the ARP table, drops stale connections, and often measurably improves speed." },
  { text: "Tip: Static electricity can destroy components — always touch a grounded metal surface before handling PC hardware." },
];

interface Props {
  mode?: "banner" | "popup";
}

export default function WallpaperTips({ mode = "banner" }: Props) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("hw-tips-dismissed");
      if (saved) setDismissed(true);
    } catch {
      // Safari Private Browsing throws SecurityError on sessionStorage access.
      // Silently ignore — tips will show for the session but that's fine.
    }
  }, []);

  // Rotate every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % TIPS.length);
        setVisible(true);
      }, 400);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  const tip = TIPS[idx];

  if (mode === "banner") {
    return (
      <div className="hw-tips-banner">
        <span className={`hw-tips-text${visible ? " hw-tips-in" : " hw-tips-out"}`}>{tip.text}</span>
        <button
          className="hw-tips-dismiss"
          onClick={() => { setDismissed(true); try { sessionStorage.setItem("hw-tips-dismissed", "1"); } catch {} }}
          aria-label="Dismiss tips"
        >X</button>
      </div>
    );
  }

  return null;
}