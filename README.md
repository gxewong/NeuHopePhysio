# NeuHope Physiotherapy 曦望物理治疗 — Website

The website for NeuHope Physiotherapy 曦望物理治疗, a physiotherapy and rehabilitation centre in Johor Bahru.

This guide is written for anyone, including people who have never used code before. Follow the steps in order and you'll have the website running on your own computer, and know how to change its details.

---

## Contents

1. [What you need](#1-what-you-need)
2. [Install Node.js (one time only)](#2-install-nodejs-one-time-only)
3. [Download the website files](#3-download-the-website-files)
4. [Open the website on your computer](#4-open-the-website-on-your-computer)
5. [Stop and restart the website](#5-stop-and-restart-the-website)
6. [Change the clinic's details](#6-change-the-clinics-details)
7. [Common problems and fixes](#7-common-problems-and-fixes)
8. [Before the website goes live](#8-before-the-website-goes-live)
9. [For developers](#9-for-developers)

---

## 1. What you need

- A Mac or Windows computer
- An internet connection
- About 15 minutes the first time

You'll install two free programs:

| Program | What it's for |
| --- | --- |
| **Node.js** | Lets your computer run the website |
| **Visual Studio Code** (optional) | A text editor for changing the clinic's details |

---

## 2. Install Node.js (one time only)

1. Go to **https://nodejs.org**
2. Click the big green button labelled **LTS** (it means "long-term support", the stable version).
3. Open the file that downloads, usually in your **Downloads** folder.
4. Click **Continue / Next** through the installer and accept the agreement. On a Mac, enter your computer password if asked.
5. When it says the installation is complete, close the installer.

**Check it worked:**

- **Mac:** press `Cmd + Space`, type **Terminal**, then press Enter.
- **Windows:** click Start, type **Command Prompt**, then press Enter.

A window with text appears. This is the **terminal**: you type a command and press Enter to run it. Type the following and press Enter:

```
node -v
```

If you see a version number such as `v22.11.0`, Node.js is installed.
If you see "command not found" or "not recognized", close the terminal window, open a new one, and try again. If it still fails, restart your computer.

---

## 3. Download the website files

**Option A: download a ZIP file (easiest)**

1. Go to **https://github.com/gxewong/NeuHopePhysio**
2. Click the green **Code** button, then **Download ZIP**.
3. Open your **Downloads** folder and double-click the ZIP file to unzip it. You'll get a folder called **NeuHopePhysio-main**.
4. Move that folder somewhere easy to find, such as your **Documents** folder.

**Option B: using Git (if you already use Git)**

```
git clone https://github.com/gxewong/NeuHopePhysio.git
```

---

## 4. Open the website on your computer

**Step 1: point the terminal at the website folder**

1. Open the terminal (see step 2).
2. Type `cd` followed by **a space**. Don't press Enter yet.
3. Drag the **NeuHopePhysio-main** folder from Finder (Mac) or File Explorer (Windows) and drop it onto the terminal window. Its location is typed in for you.
4. Press **Enter**.

It should look something like this:

```
cd /Users/yourname/Documents/NeuHopePhysio-main
```

**Step 2: install the website's building blocks (first time only)**

Type this and press Enter:

```
npm install
```

Wait until it finishes, which takes about a minute. You may see words like "warn" or "audit". That's normal and can be ignored.

**Step 3: start the website**

```
npm run dev
```

After a few seconds you'll see a line like:

```
➜  Local:   http://localhost:5173/
```

**Step 4: view it.** Open your web browser (Chrome, Safari or Edge) and go to **http://localhost:5173**

The website is now running on your computer. Only you can see it. It isn't on the internet yet.

---

## 5. Stop and restart the website

- **To stop:** click in the terminal window and press `Ctrl + C`, or just close the terminal window.
- **To start it again another day:** open the terminal, repeat **Step 1** (`cd` and drag the folder), then type `npm run dev`. You don't need `npm install` again.

While the website is running, any change you save to its files appears in the browser within a second or two.

---

## 6. Change the clinic's details

Almost everything you'll want to change is in **one file**:

```
src/data/site.ts
```

### Open the file

1. Install **Visual Studio Code** from **https://code.visualstudio.com** (free).
2. Open it and choose **File → Open Folder…**, then pick the **NeuHopePhysio-main** folder.
3. In the list on the left, click **src**, then **data**, then **site.ts**.

### Edit the details

Near the top you'll find a section that looks like this:

```ts
export const clinic: ClinicDetails = {
  name: 'NeuHope Physiotherapy 曦望物理治疗',
  address: "101, Jln Adda 3/1, Adda Heights, 81100 Johor Bahru, Johor Darul Ta'zim",
  phone: "+60 128080432",
  whatsapp: null, // [Insert official WhatsApp number]
  email: null, // [Insert clinic email address]
  hours: ["Monday – Friday: 9am – 6pm", "Saturday: 9am – 3pm", "Sunday: Closed"],
  ...
```

**The rules:**

- Only change the text **inside the quotation marks**.
- Keep the **quotation marks** `" "` and the **comma** `,` at the end of each line.
- `null` means "not filled in yet". The website shows a placeholder such as `[Insert clinic email address]` instead.
- To fill in a `null`, replace the word `null` with your text in quotation marks.

**Example: adding the email address**

Before:
```ts
  email: null, // [Insert clinic email address]
```
After:
```ts
  email: "hello@neuhope.com.my",
```

**Example: adding the WhatsApp number.** Use digits only, starting with the country code (60 for Malaysia), with no `+`, spaces or dashes:
```ts
  whatsapp: "60128080432",
```
Once added, a **Chat on WhatsApp** button appears on the website automatically.

**Example: changing opening hours.** Each line goes in its own quotation marks, separated by commas:
```ts
  hours: ["Monday – Friday: 9am – 6pm", "Saturday: 9am – 3pm", "Sunday: Closed"],
```

When you're done, save with **Cmd + S** (Mac) or **Ctrl + S** (Windows).

### What else can be changed in the same file

| What | Look for |
| --- | --- |
| Address, phone, WhatsApp, email, opening hours | `clinic` |
| Facebook and Instagram links | `social` |
| The six services and their descriptions | `services` |
| Frequently asked questions | `faqs` |
| Staff profiles in "Our Team" (photos go in `public/team`) | `team` |
| Photos on the Gallery page (photos go in `public/gallery`) | `gallery` |
| Patient testimonials (only real ones, with the patient's permission) | `testimonials` |
| Show or hide the testimonials section | `SHOW_TESTIMONIALS` (`true` = show, `false` = hide) |
| Connect the enquiry form to an email service | `ENQUIRY_ENDPOINT` (see below) |

### Changing the logo or photos

The logo and photos are in the folder **src/assets/images**:

| File | Where it appears |
| --- | --- |
| `logo.jpg` | Top of the page and the footer |
| `hero.webp` | Large photo at the top |
| `about.webp` | "About Neuhope" section |
| `band.webp` | "Why Neuhope" section |

To replace one, put your new picture in that folder **with exactly the same file name**, replacing the old one. Also copy the new logo to `public/favicon.jpg` to update the small icon in the browser tab.

### Changing other wording on the page

Headings and paragraphs are in the files inside **src/components**. To find a sentence, press **Cmd + Shift + F** (Mac) or **Ctrl + Shift + F** (Windows) in Visual Studio Code and type a few words from it. Change only the words, not the symbols around them.

### The enquiry form

The form checks that visitors have filled it in correctly, but **it does not send anything yet**. The website tells visitors this, so nobody thinks their enquiry was sent.

To make it send enquiries to the clinic's email:

1. Create a free account at **https://formspree.io** and create a new form.
2. Formspree gives you a link like `https://formspree.io/f/abcdwxyz`.
3. In `site.ts`, find `ENQUIRY_ENDPOINT` and change it to:
   ```ts
   export const ENQUIRY_ENDPOINT: string | null = "https://formspree.io/f/abcdwxyz";
   ```

---

## 7. Common problems and fixes

| What you see | What to do |
| --- | --- |
| `command not found: npm` or `'npm' is not recognized` | Node.js isn't installed, or the terminal was open during installation. Close the terminal, open a new one and try again. If it still fails, reinstall Node.js (step 2). |
| `no such file or directory` after `cd` | The folder location is wrong. Type `cd ` (with a space) and drag the folder onto the terminal again. |
| `Could not read package.json` | The terminal isn't pointed at the website folder. Repeat Step 1 in section 4. |
| A dark box with red text appears over the website | There's a typing mistake in a file you edited, usually a missing quotation mark `"` or comma `,`. The box shows the file name and line number. Fix it and save, and the box disappears. |
| A word has an apostrophe, e.g. `Ta'zim` | Wrap that text in double quotes `"..."` rather than single quotes `'...'`. |
| `Port 5173 is in use` | The website is already running in another terminal window. Use that one, or close it first. |
| The page is blank or doesn't change | Refresh the browser. If that doesn't help, stop the website (`Ctrl + C`) and run `npm run dev` again. |

---

## 8. Before the website goes live

- [ ] Add the clinic's **email** and **WhatsApp** number in `site.ts`
- [ ] Confirm the **six services** match what the clinic actually offers
- [ ] Connect the **enquiry form** (section 6) and add a link to the clinic's **Privacy Policy**
- [ ] Add real, approved **testimonials**, or set `SHOW_TESTIMONIALS` to `false`
- [ ] Consider replacing the stock photos with real photos of the clinic (with permission from anyone pictured)

To put the website on the internet, a free service such as **Vercel** (vercel.com) or **Netlify** (netlify.com) can publish it directly from this GitHub repository.

---

## 9. For developers

**Tech stack:** React 18, TypeScript, Vite 5, Tailwind CSS 3, Lucide React icons.

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # type-check and build to /dist
npm run preview    # preview the production build
```

**Project structure**

```
src/
  App.tsx                 page composition
  data/site.ts            all editable content and clinic details
  assets/images/          logo and photos
  components/
    Navbar.tsx            sticky header, active-section highlight, mobile menu
    HeroSection.tsx
    TrustHighlights.tsx
    AboutSection.tsx
    ServicesSection.tsx   "Enquire" links pre-select the service in the form
    WhyChooseUs.tsx
    OurApproach.tsx       horizontal timeline on desktop, vertical on mobile
    CallToAction.tsx
    TestimonialsSection.tsx
    FAQSection.tsx        accessible accordion (arrow keys, Home/End)
    ContactSection.tsx    contact details + validated enquiry form
    Footer.tsx
    BackToTop.tsx, Logo.tsx, SocialIcon.tsx, SmartImage.tsx, SectionHeading.tsx, ClinicValue.tsx
tailwind.config.js        brand colours, fonts, radii, shadows
src/index.css             buttons, cards, form field styles
index.html                page title, meta description, Open Graph tags
```

**Brand colours** (`tailwind.config.js`): teal `#255957`, dark teal `#1B4341`, yellow `#F4C542`, soft teal `#E6F0EF`, light grey `#F4F7F7`, text `#233534`.

**Enquiry form:** `ENQUIRY_ENDPOINT` must accept a JSON `POST` and return a 2xx status. While it is `null`, the form validates input and clearly states that nothing has been sent; it never shows a false success message.

**Accessibility:** semantic landmarks and headings, skip link, visible focus rings, labelled form fields with linked inline errors, keyboard-operable menu and accordion, `prefers-reduced-motion` respected, descriptive alt text.

---

## Image credits

Stock photos from [Unsplash](https://unsplash.com) (Unsplash License). They are illustrative only and do not show NeuHope's staff or patients.

- `hero.webp` — Ortopediatri Çocuk Ortopedi Akademisi (unsplash.com/photos/B3qVNvZ0AHY)
- `about.webp` — Yury Kirillov (unsplash.com/photos/pbUWW-CBoqY)
- `band.webp` — Sincerely Media (unsplash.com/photos/5uLbdKsUXMg)

The NeuHope name and logo belong to NeuHope Physiotherapy 曦望物理治疗.
