Abdul Basid — Portfolio
=======================

A modern, scroll-animated single-page portfolio for Abdul Basid (Android Developer).
Rebuilt from scratch with plain HTML, CSS and JavaScript — no frameworks, no build step.

Tech / design
-------------
- Vanilla HTML + CSS + JS (self-contained, no third-party libraries bundled)
- Google Fonts: Space Grotesk + Inter
- Scroll-based animations via IntersectionObserver (reveal on scroll, scroll-spy nav,
  count-up stats, scroll progress bar), a typed hero role, and CSS-only ambient/parallax effects
- Fully responsive with a mobile nav menu
- Respects prefers-reduced-motion

Structure
---------
  index.html            Page markup + inline SVG icon sprite
  assets/css/style.css  All styling and animations
  assets/js/main.js     All interactions (no dependencies)
  assets/img/           Photos
  assets/Abdul_Basid_Resume.pdf   CV linked from the hero "Download CV" button

Local preview
-------------
  python -m http.server 8777
  # then open http://127.0.0.1:8777

Contact form (EmailJS)
----------------------
The contact form sends messages straight to the inbox using EmailJS (no backend).
Until it's configured it safely falls back to opening the visitor's mail client (mailto:).

On submit the form fires TWO emails via one EmailJS service:
  A. Notification -> YOU        (email/contact-notification-emailjs.html)  — has the message
  B. Auto-reply   -> the VISITOR (email/thankyou-autoreply-emailjs.html)   — gold "thank you"
Each is a separate EmailJS template; both are optional (fill whichever IDs you want).

Setup (one time):
  1. Create a free account at https://www.emailjs.com and verify your email.
  2. Email Services  -> "Add New Service" -> connect Gmail (theabdulbasid@gmail.com).
     Copy the SERVICE ID.
  3. Email Templates -> "Create New Template" for the NOTIFICATION. Switch the editor to
     code view ("< >") and paste  email/contact-notification-emailjs.html.
     Settings:  To = theabdulbasid@gmail.com,  Reply-To = {{email}}.  Copy its TEMPLATE ID.
  4. Email Templates -> "Create New Template" for the AUTO-REPLY. Paste
     email/thankyou-autoreply-emailjs.html.
     Settings:  To = {{email}},  Reply-To = theabdulbasid@gmail.com,  From Name = Abdul Basid.
     Copy its TEMPLATE ID.
  5. Account -> General -> copy your PUBLIC KEY.
  6. In index.html fill window.EMAILJS_CONFIG:
        publicKey: "...", serviceId: "...",
        templateId: "..."            (notification, step 3)
        autoReplyTemplateId: "..."   (auto-reply,   step 4)
  7. (Recommended) Account -> Security -> add your domain to "Allowed Origins" and enable
     reCAPTCHA / rate-limits so nobody can abuse the public key.

Template variables sent from the form:  {{name}}  {{email}}  {{message}}
(plus reply_to, to_email, title). Keep these names identical in both EmailJS templates.
