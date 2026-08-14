export type HelpArticle = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  intro: string;
  sections: HelpSection[];
  relatedSlugs: string[];
};

export type HelpSection = {
  heading: string;
  content: string;
  steps?: string[];
  bestPractices?: string[];
  avoid?: string[];
};

export type HelpFaq = {
  question: string;
  answer: string;
  tags: string[];
};

export type SupportLink = {
  title: string;
  value: string;
  href: string;
  description: string;
};

export const helpArticles: HelpArticle[] = [
  {
    slug: "getting-started",
    title: "Getting started with Plugr",
    description: "Create your account, complete verification, and make your first impression count.",
    icon: "\u{1F680}",
    category: "Getting Started",
    intro:
      "Plugr connects you with verified service providers on campus. Whether you need a graphic designer for your department's event or you want to offer barbing services to fellow students, everything starts with a complete and trustworthy profile. This guide walks you through the full setup process so you can start using the platform within minutes.",
    sections: [
      {
        heading: "Create your account",
        content:
          "Head to useplugr.app and tap Register. You will need a valid school email address (yourname@st.lasu.edu.ng). After submitting the form, check your inbox for a verification code. Enter the code on the verification page to confirm your email and unlock the rest of the platform. The code expires in 15 minutes, so enter it promptly. Without email verification, your account remains inactive and you cannot appear in search results or contact other users.",
        steps: [
          "Go to useplugr.app and tap Register.",
          "Enter your full name, school email address, and a strong password.",
          "Check your inbox for a verification code (also check spam if you do not see it).",
          "Go to the verification page and enter the code to confirm your email.",
          "Once verified, you will be redirected to the profile setup wizard.",
        ],
      },
      {
        heading: "Complete your profile",
        content:
          "Your profile is the first thing other students see when they find you in Discover. A complete profile signals that you are a real person who takes their work seriously. The setup wizard walks you through each field one at a time. You can always edit these later from your profile page, but filling them out correctly on day one gives you the best start.",
        steps: [
          "Upload a clear profile photo where your face is visible. Avoid group photos, heavily filtered images, or logos.",
          "Enter your full name exactly as it appears on your school records. This matters for verification later.",
          "Select your faculty and enter your department. These fields help students find you when they search by department.",
          "Choose your current level (100\u2013600 or Postgraduate).",
          "Pick the campus location where you are most available. Students often filter by proximity.",
          "Add an active phone number. This is how clients reach you for quick bookings.",
          "Select your primary skill from the list, or type a custom skill if yours is not listed.",
          "Write a short bio (2\u20133 sentences) explaining what you offer, your experience level, and why someone should choose you.",
          "Choose your mode: Provider (you offer services), Requester (you need services), or Both.",
        ],
        bestPractices: [
          "Use a photo taken in good lighting with a simple background. Profiles with clear photos receive up to 3x more views than those without.",
          "Write your bio in first person and keep it specific. Instead of \u201cI do graphics,\u201d try \u201cI design posters, flyers, and social media graphics for campus events and student organizations.\u201d",
          "List only skills you can actually deliver on. Overpromising leads to negative reviews that hurt your credibility score.",
          "Set your location to where you spend the most time on campus, not just your faculty building.",
        ],
        avoid: [
          "Leaving profile fields blank reduces your visibility in search results and makes you look less trustworthy.",
          "Using a nickname instead of your real name makes verification impossible and confuses potential clients.",
          "Skipping the bio entirely means students have no reason to pick you over someone who wrote one.",
        ],
      },
      {
        heading: "Start exploring Discover",
        content:
          "Once your profile is complete, open the Discover tab. This is where you browse other students by skill, credibility, and verification status. You can search by faculty, department, or specific skill name. Tap any profile to see their full details, reviews, and store. If you are in Provider or Both mode, other students can find and contact you the same way.",
        steps: [
          "Open the Discover tab from the main navigation.",
          "Use the search bar to filter by skill name, faculty, or department.",
          "Tap a provider's card to view their full profile, reviews, and store.",
          "Use the Contact button to reach out directly via the channel they have listed.",
        ],
      },
    ],
    relatedSlugs: ["profile-setup", "credibility"],
  },
  {
    slug: "profile-setup",
    title: "Optimizing your profile for maximum exposure",
    description: "The specific steps that make your profile stand out in search results and convert visitors into clients.",
    icon: "\u{1F464}",
    category: "Profile",
    intro:
      "Your profile is your storefront on Plugr. Students decide within seconds whether to contact you based on three things: your photo, your skill title, and your bio. This article breaks down exactly how to optimize each element so you appear higher in search results and convert more profile views into actual conversations.",
    sections: [
      {
        heading: "Your profile photo",
        content:
          "The photo is the first element students see in the Discover feed. A professional-looking photo immediately separates you from competitors who use blurry selfies or no photo at all. The goal is simple: make it easy for someone to recognize and trust you before they even read your bio.",
        steps: [
          "Use a recent, well-lit headshot or upper-body photo. Natural lighting works better than heavy filters.",
          "Make sure your face takes up at least 40% of the frame. Full-body or group photos do not work well at small sizes.",
          "Avoid using logos, anime characters, or abstract images. People want to see the person they will be working with.",
          "Keep the background simple and uncluttered. A plain wall, a desk, or outdoor greenery all work.",
        ],
        bestPractices: [
          "Photos with a clean background and visible face get significantly more profile views than photos without.",
          "If you offer a creative service, your photo can reflect your personality \u2014 but your face should still be the focus.",
          "Update your photo every 6\u201312 months to keep your profile looking current.",
        ],
        avoid: [
          "Uploading screenshots, memes, or images with heavy text overlays.",
          "Using photos from years ago that no longer look like you.",
          "Leaving the photo slot empty. Profiles without photos receive almost no engagement.",
        ],
      },
      {
        heading: "Your skill title and bio",
        content:
          "Your skill title is what appears in the Discover feed. It should be specific and match what students actually search for. Your bio expands on that \u2014 it explains what you do, who you serve, and why you are reliable. Together, these two fields determine whether someone taps your profile or scrolls past.",
        steps: [
          "Choose a primary skill that is specific and searchable. \u201cGraphics Design\u201d works better than \u201cCreative Services.\u201d",
          "If your skill is not in the predefined list, select \u201cOther\u201d and type it clearly.",
          "Write a bio that answers three questions: What do you do? Who is it for? Why should they choose you?",
          "Keep your bio between 2\u20135 sentences. Long paragraphs get skipped.",
          "Mention your level, faculty, or a specific achievement if it adds credibility.",
        ],
        bestPractices: [
          "Use the exact skill name students search for. If people search for \u201cbarbing,\u201d use that word instead of \u201cmens grooming.\u201d",
          "Include one specific detail that sets you apart. For example: \u201cI have designed over 50 event posters for LASU student organizations.\u201d",
          "Write in first person. It feels more personal and trustworthy than third-person descriptions.",
          "Proofread your bio. Spelling errors and broken sentences signal carelessness.",
        ],
        avoid: [
          "Using vague language like \u201cI do everything\u201d or \u201cjack of all trades.\u201d Specificity builds trust.",
          "Writing a bio that is just a list of adjectives (\u201cHardworking, dedicated, creative\u201d). Show, don\u2019t tell.",
          "Copying another provider\u2019s bio word for word. Originality matters.",
        ],
      },
      {
        heading: "Launching your store",
        content:
          "As a verified provider, you can launch your own store on Plugr. Your store has its own page where you list products and services with images, prices, and descriptions \u2014 and it earns you 5 credibility points. Think of it as a dedicated storefront that showcases your range and makes it easy for students to browse and buy.",
        steps: [
          "Complete your profile and get verified. Only verified providers can launch a store.",
          "Open Stores and tap Set up your store. Give it a name, tagline, and description.",
          "Add products and services with real photos, prices, and short descriptions.",
          "Share your store link \u2014 shoppers can browse it at /stores/your-store-name.",
        ],
        bestPractices: [
          "Use real photos of work you have actually done. Screenshots of past projects, photos of physical products, or mockups of designs all work.",
          "Price your services competitively. If you are unsure, check what similar providers charge on Plugr.",
          "Write a one-sentence description for each product that explains what the client gets.",
        ],
        avoid: [
          "Adding products with no images. Visual content gets far more engagement.",
          "Listing products you cannot actually deliver on. Only showcase work you can reproduce consistently.",
          "Using stock photos instead of your own work. Clients can tell the difference.",
        ],
      },
      {
        heading: "Keeping your profile current",
        content:
          "An outdated profile sends the wrong signal. If your location, skill, or availability has changed, update it. Profiles that are updated regularly tend to rank higher in search results because the platform interprets recent activity as a sign of an active, available provider.",
        steps: [
          "Review your profile every 2\u20134 weeks to make sure all details are accurate.",
          "Update your location if your schedule or campus area has changed.",
          "Add new products to your store or remove ones you no longer offer.",
          "Refresh your bio if your skill set or focus has evolved.",
        ],
      },
    ],
    relatedSlugs: ["profile-setup", "credibility", "stores"],
  },
  {
    slug: "credibility",
    title: "How credibility scoring works",
    description: "A complete breakdown of the 0\u2013100 scoring system, what each range means, and how to build your score over time.",
    icon: "\u{2B50}",
    category: "Credibility",
    intro:
      "Credibility is Plugr\u2019s trust metric. It ranges from 0 to 100 and appears as a color-coded badge on your profile and in the Discover feed. Other students use this score to decide whether to contact you. A higher score means more visibility, more trust, and more conversations. This article explains exactly how the score is calculated, what the color ranges mean, and what you can do to build it sustainably.",
    sections: [
      {
        heading: "The three components of credibility",
        content:
          "Your credibility score (0\u2013100) is calculated from three components: profile setup (up to 30 points), verification status (20 points when verified), and reviews (up to 50 points). Profile and verification are entirely within your control. Reviews require sustained, genuine work over time.",
      },
      {
        heading: "Profile setup score (up to 30 points)",
        content:
          "The profile setup component evaluates how complete and trustworthy your profile looks. Each field contributes a specific number of points toward the 30-point maximum. Leaving fields blank directly reduces your score.",
        steps: [
          "Full name \u2014 6 points. Must be entered and match your school records.",
          "Profile photo \u2014 6 points. A clear, recognizable photo is required.",
          "Bio \u2014 5 points. A written introduction explaining your services and reliability.",
          "Primary skill \u2014 4 points. Your main service offering.",
          "Contact (phone or email) \u2014 4 points. An active way for clients to reach you.",
          "Store launched \u2014 5 points. Set up your store as a verified provider.",
        ],
        bestPractices: [
          "Complete every field to reach the full 30 points. A half-finished profile caps your maximum score at 50 (30 profile + 20 verification).",
          "Launch your store. It is worth 5 points and gives students a dedicated page to browse and buy from you.",
        ],
        avoid: [
          "Leaving fields blank and expecting a high score. Each missing field costs you specific points.",
          "Skipping your bio. It is worth 5 points and is one of the easiest fields to complete.",
        ],
      },
      {
        heading: "Verification score (20 points)",
        content:
          "When your profile is verified (badge status is \u201cVerified\u201d), you earn 20 points. This is a binary either/or \u2014 you either have the badge and earn 20 points, or you do not and earn 0. The verified badge is one of the fastest ways to jump from the Low range into the Moderate range.",
        bestPractices: [
          "Complete verification early. It is the single fastest way to add 20 points to your score.",
          "Keep your name consistent across your profile and verification documents. Name changes trigger a badge re-review.",
        ],
        avoid: [
          "Requesting badge review with an incomplete profile. This wastes time and delays approval.",
          "Changing your name or faculty frequently. Each major change sends your badge back under review.",
        ],
      },
      {
        heading: "Review score (up to 50 points)",
        content:
          "Reviews earned through completed interactions contribute up to 50 points. Each review is mapped from a 1\u20135 star rating to a point value: 1 star = 0.5 points, 2 stars = 1.0, 3 stars = 1.5, 4 stars = 2.0, 5 stars = 2.5. These points are then multiplied by the reviewer\u2019s confidence weight. The total is capped at 50, meaning you do not need hundreds of reviews to max out this component \u2014 you need consistent high-quality reviews from credible reviewers.",
        steps: [
          "Complete genuine service requests through the platform.",
          "After each completed interaction, the client can leave a review with a 1\u20135 star rating and comment.",
          "A 5-star review from a credible reviewer contributes 2.5 points (multiplied by their confidence weight).",
          "A 3-star review contributes 1.5 points \u2014 still positive, but less impact than a strong review.",
          "A 1-star review contributes only 0.5 points \u2014 minimal impact but not zero.",
          "The total review points are capped at 50. Once you reach 50, additional reviews do not increase this component.",
        ],
        bestPractices: [
          "Focus on delivering excellent work consistently. Strong reviews from credible reviewers build your score faster.",
          "Encourage clients to leave honest reviews after every completed interaction. Do not pressure them or offer incentives.",
          "Respond professionally to any feedback. How you handle criticism affects how others perceive your profile.",
          "Build reviews over weeks and months. This is a long-term metric by design.",
        ],
        avoid: [
          "Asking friends to leave fake reviews. The system weights reviews by authenticity and reviewer credibility.",
          "Expecting rapid score increases from reviews alone. Each review contributes between 0.5 and 2.5 points.",
          "Avoiding the platform after a bad review. Your response and future work matter more than a single negative rating.",
        ],
      },
      {
        heading: "Score ranges and what they mean",
        content:
          "Your score is color-coded so other students can see your standing at a glance. Here is what each range represents:",
        steps: [
          "0\u201310 (Critical, Red) \u2014 Incomplete profile, no verification, no reviews. This is the starting point for new accounts.",
          "11\u201320 (Low, Orange) \u2014 Partially complete profile or newly verified with few or no reviews.",
          "21\u201330 (Moderate, Yellow) \u2013 Complete profile, verified, and starting to collect reviews.",
          "31\u201360 (Good, Amber) \u2014 Fully verified with a solid review history. This is where most active providers land.",
          "61\u2013100 (Excellent, Green) \u2014 Fully verified, many positive reviews, and sustained high-quality work over time.",
        ],
        bestPractices: [
          "Track your score on your profile page. It updates as you complete fields and earn reviews.",
          "Aim for the Good range (31\u201360) as your medium-term goal. This requires consistent work and a complete profile.",
          "The Excellent range (61+) is earned over months of genuine service delivery and positive client relationships.",
        ],
        avoid: [
          "Panicking if your score does not move quickly. The system is designed to reward sustained effort.",
          "Making major profile changes when you are close to a color threshold. Changes can temporarily lower your score.",
          "Comparing your score to providers who have been on the platform for much longer. Context matters.",
        ],
      },
    ],
    relatedSlugs: ["verification", "profile-setup"],
  },
  {
    slug: "verification",
    title: "Verification and the credibility badge",
    description: "How email verification and the credibility checklist work, and what happens when your badge goes under review.",
    icon: "\u{2705}",
    category: "Verification",
    intro:
      "Plugr uses two separate verification concepts. Email verification confirms that you own the email address you registered with. The credibility badge is a public-facing trust indicator that confirms you have completed the identity and reliability checklist. Understanding the difference between these two is important for managing your profile and maintaining your badge status.",
    sections: [
      {
        heading: "Email verification",
        content:
          "Email verification is the first step after creating your account. Without it, your account remains inactive. You cannot appear in search results, contact other users, or receive messages. The process is straightforward: you receive a verification code after signing up, and entering it on the verification page confirms your address. The code expires in 15 minutes. If you did not receive it, check your spam folder or request a new code from the verification page.",
        steps: [
          "Check your inbox for an email from Plugr with a verification code.",
          "Tap the link to confirm your email address.",
          "If the link has expired, go to the verification page and request a new one.",
          "Once verified, your account becomes active and you can complete your profile.",
        ],
      },
      {
        heading: "The credibility badge",
        content:
          "The credibility badge is a separate system that appears on your public profile. It tells other students that you have completed the identity and reliability checklist \u2014 including a complete profile, consistent name, and active photo. The badge is a prerequisite for reaching the higher credibility score ranges. Without it, your maximum possible score is significantly capped.",
        steps: [
          "Complete all profile fields: name, photo, bio, faculty, department, level, location, and phone.",
          "Navigate to your verification area in the app.",
          "Complete the credibility checklist items.",
          "Submit your badge request for review.",
          "If approved, the verified badge appears on your profile and in the Discover feed.",
        ],
        bestPractices: [
          "Make sure your profile is 100% complete before requesting badge review. Partial profiles are automatically rejected.",
          "Use the same name across your profile and any verification documents you submit.",
          "Keep your photo current. A photo that clearly does not match your appearance can trigger a review hold.",
        ],
        avoid: [
          "Requesting badge review with an incomplete profile. This wastes time and delays approval.",
          "Changing your name or photo immediately after getting verified. This triggers an automatic re-review.",
          "Treating the badge as permanent. Important profile changes can send it back under review.",
        ],
      },
      {
        heading: "Badge review after profile changes",
        content:
          "When you make significant changes to your profile \u2014 especially your name or photo \u2014 the system automatically sends your badge back under review. This is by design. It ensures that the verified badge continues to mean something. During the review period, your badge status shows as \u201cPending\u201d until the changes are verified. Your credibility score may temporarily drop during this period.",
        steps: [
          "After changing your name or photo, your badge status changes to \u201cPending.\u201d",
          "The review typically takes a short period. No action is required from you during this time.",
          "Once the review is complete, your badge status returns to \u201cVerified\u201d or notes any issues.",
          "If your badge was rejected, check your profile for inconsistencies and correct them before re-requesting.",
        ],
        bestPractices: [
          "Avoid changing your name unless absolutely necessary. Each change triggers a full re-review.",
          "If you need to update your photo, choose one that is clearly you and matches your previous photo style.",
          "Keep your other profile fields stable while your badge is under review.",
        ],
        avoid: [
          "Making multiple profile changes at the same time. This increases the chance of a review hold.",
          "Contacting support repeatedly during the review period. The process is automatic and does not require manual intervention.",
        ],
      },
    ],
    relatedSlugs: ["credibility", "profile-setup", "stores"],
  },
  {
    slug: "discover",
    title: "Getting the most out of Discover",
    description: "How the search algorithm works, what affects your visibility, and how to find the right providers faster.",
    icon: "\u{1F50D}",
    category: "Discover",
    intro:
      "Discover is where students find service providers on Plugr. The results are ranked by a combination of verification status, credibility score, recency, and relevance to your search. Whether you are looking for someone or trying to be found, understanding how Discover works helps you use it more effectively.",
    sections: [
      {
        heading: "How search works",
        content:
          "When you type in the search bar, Plugr matches your query against provider names, skill titles, and bios. The results are then sorted by a ranking algorithm that considers verification status, credibility score, how recently the profile was updated, and how well the profile matches your search term. Verified providers with higher credibility scores appear first.",
        steps: [
          "Use specific skill names for the best results. \u201cWeb Development\u201d will find more relevant providers than \u201ctech.\u201d",
          "Filter by faculty or department if you want someone local to your area.",
          "Check the credibility badge and score on each profile before contacting.",
          "Tap into a provider\u2019s full profile to see their reviews, store, and contact options.",
        ],
        bestPractices: [
          "Start with broad searches and narrow down as you see results.",
          "Use the same terminology that providers use in their skill titles.",
          "If you are not finding what you need, try different keywords or check related skills.",
        ],
        avoid: [
          "Searching with overly specific phrases that might not match any profile.",
          "Ignoring credibility scores. A lower score does not always mean bad service, but it is a useful signal.",
          "Contacting the first result without checking other options. Comparing profiles leads to better choices.",
        ],
      },
      {
        heading: "Improving your visibility in search",
        content:
          "If you are a provider and want to appear higher in Discover results, the ranking algorithm considers several factors. Verification and credibility are the most important, but profile completeness, recency, and engagement also play a role.",
        steps: [
          "Complete your profile fully. Every field you fill adds to your ranking weight.",
          "Get verified. Verified providers are prioritized in search results.",
          "Keep your profile updated. Profiles that are recently modified tend to rank higher.",
          "Collect positive reviews. Higher credibility scores push you up in the results.",
          "Launch your store. Verified providers with a store get more surface area for search matching.",
        ],
        bestPractices: [
          "Update your profile every few weeks to signal that you are active and available.",
          "Use the exact skill name that students search for in your title and bio.",
          "Keep your credibility score climbing by delivering consistent work and earning reviews.",
        ],
        avoid: [
          "Keyword stuffing your bio with unrelated terms. This does not improve ranking and can hurt trust.",
          "Neglecting your profile after initial setup. Stale profiles drop in ranking over time.",
          "Expecting instant results. Search ranking improves gradually as your profile matures.",
        ],
      },
      {
        heading: "Contacting a provider",
        content:
          "When you find someone you want to work with, tap the Contact button on their profile. This opens a direct channel to reach them. Providers list their preferred contact method \u2014 typically phone or the platform\u2019s messaging system. Be clear about what you need, when you need it, and any budget details in your first message.",
        steps: [
          "Open the provider\u2019s full profile from the Discover feed.",
          "Review their products, store, and credibility score.",
          "Tap Contact and choose the available channel.",
          "Send a clear, concise message describing your request.",
        ],
        bestPractices: [
          "Be specific in your first message. Instead of \u201cHey, are you available?\u201d try \u201cHi, I need a flyer designed for a department event on March 15. Do you have availability?\u201d",
          "Include your budget or price range if you have one in mind.",
          "Mention if the request is urgent. Some providers have faster turnaround times than others.",
        ],
        avoid: [
          "Sending vague messages that require back-and-forth to understand what you need.",
          "Contacting multiple providers simultaneously without telling them. This creates confusion and wasted effort.",
          "Expecting instant replies. Providers are students too and may take a few hours to respond.",
        ],
      },
    ],
    relatedSlugs: ["profile-setup", "credibility"],
  },
  {
    slug: "stores",
    title: "Plugr Stores: selling and buying on campus",
    description: "Launch your store, list products, and buy from verified campus providers via WhatsApp.",
    icon: "\u{1F6CD}\uFE0F",
    category: "Stores",
    intro:
      "Plugr Stores is the marketplace built into Plugr. Verified providers can launch a dedicated storefront where they list products and services with photos, prices, and descriptions. Students can browse those products, see exactly who is selling them, and place orders directly over WhatsApp. This guide covers everything from setting up your store to buying your first product.",
    sections: [
      {
        heading: "Who can launch a store",
        content:
          "Only verified providers can launch a store on Plugr. Verification confirms you are a real LASU student who completed the identity and reliability checklist, which keeps the marketplace trustworthy. If you are not yet verified, complete the verification flow first \u2014 your store unlocks the moment your badge is approved.",
        steps: [
          "Complete your profile fully, including your real name, photo, faculty, department, and level.",
          "Get verified through the verification flow on your profile.",
          "Once your badge is approved, open the Stores page.",
        ],
      },
      {
        heading: "Set up your store",
        content:
          "Setting up a store takes just a few minutes. You give it a name, a tagline, a description, a banner image, a logo, and a WhatsApp number for orders. The store gets its own public page at /stores/your-store-name, which you can share anywhere.",
        steps: [
          "From the Stores page, tap Set up your store.",
          "Enter a store name (for example, \u201cJem's Kreatives\u201d). You can edit this later.",
          "Add a tagline and a short description explaining what you sell.",
          "Upload a wide banner image (1200 \u00d7 300 recommended) and a square logo (512 \u00d7 512 recommended).",
          "Add your WhatsApp number, or leave it blank to use your profile phone.",
          "Tap Create store. You will be redirected to your new storefront.",
        ],
        bestPractices: [
          "Choose a store name that is easy to remember and reflects what you sell.",
          "Use real photos for your banner and logo. Your storefront represents your brand.",
          "Keep your WhatsApp number up to date so buyers can always reach you.",
        ],
        avoid: [
          "Using someone else's logo or brand imagery as your store logo.",
          "Leaving the banner or logo blank \u2014 a visual identity builds trust.",
        ],
      },
      {
        heading: "Adding products and services",
        content:
          "Your store comes with a product manager where you add everything you sell. Each product needs a name, a category, a price, a short description, and up to 8 photos. Buyers see your products on your storefront and can buy them with one tap.",
        steps: [
          "Open your store manager (Stores \u2192 My store).",
          "Tap Add product and fill in the name, category, and price.",
          "Write a one-sentence description explaining what the buyer gets.",
          "Upload real photos of the product or past work.",
          "Save the product \u2014 it appears on your storefront immediately.",
        ],
        bestPractices: [
          "Use clear photos of work you have actually done. Screenshots, mockups, and photos of physical products all work.",
          "Price competitively. Check what similar providers on Plugr charge.",
          "Update your product list regularly. Remove items you no longer offer.",
        ],
        avoid: [
          "Listing products without images \u2014 visual content gets far more engagement.",
          "Listing items you cannot actually deliver on. Only showcase work you can reproduce consistently.",
        ],
      },
      {
        heading: "Buying from a store",
        content:
          "Buying is simple. Find a product on the Stores page, open it, and tap Buy Now. Plugr takes you to WhatsApp with a pre-written message to the provider, where you can confirm the order and agree on delivery or pickup. Payments happen off-platform between you and the provider.",
        steps: [
          "Browse products on the Stores page or a store's storefront.",
          "Tap any product to see its full details, photos, and the seller.",
          "Tap Buy Now to open a WhatsApp chat with the provider.",
          "Send the message to confirm your order, price, and pickup or delivery.",
        ],
        bestPractices: [
          "Check the provider's profile and credibility score before ordering.",
          "Confirm the final price and payment method in the WhatsApp chat before committing.",
          "Agree on a pickup location and time upfront to avoid delays.",
        ],
        avoid: [
          "Sharing sensitive information like passwords or bank PINs with any provider.",
          "Paying in full before you are sure the provider is reliable.",
        ],
      },
      {
        heading: "Managing your store",
        content:
          "You can edit your store's name, images, and details at any time, and you can delete the store entirely if you no longer want to sell. Deleting a store also removes its products.",
        steps: [
          "Open Stores \u2192 My store to manage your products.",
          "Tap Edit store to update your name, banner, logo, tagline, description, or WhatsApp number.",
          "Tap Delete store to permanently remove your store and all of its products. This cannot be undone.",
        ],
        bestPractices: [
          "Keep your banner, logo, and product photos fresh so your store looks active.",
          "Respond quickly to Buy Now messages \u2014 fast responses win orders.",
        ],
        avoid: [
          "Deleting your store if you still have pending orders. Fulfil or cancel them first.",
        ],
      },
    ],
    relatedSlugs: ["profile-setup", "credibility", "discover"],
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting and account issues",
    description: "Common problems and their solutions before you need to contact support.",
    icon: "\u{1F527}",
    category: "Support",
    intro:
      "Most issues on Plugr have simple fixes that you can try before reaching out to support. This guide covers the most common problems students encounter, from login issues to image upload failures, and walks you through the steps to resolve them quickly.",
    sections: [
      {
        heading: "Login and authentication issues",
        content:
          "If you cannot log in, the most common causes are an incorrect password, an unverified email, or a stale browser session. Before contacting support, try these steps in order.",
        steps: [
          "Double-check your email address and password. Passwords are case-sensitive.",
          "If you forgot your password, use the Reset Password link on the login page.",
          "If your email is not verified, check your inbox and spam folder for the verification code.",
          "Clear your browser cache and cookies, then try again.",
          "Try opening the site in an incognito or private browsing window.",
          "If none of these work, sign out completely, close the browser, and sign in fresh.",
        ],
        bestPractices: [
          "Use a password manager to avoid typing errors.",
          "If you recently changed your email, make sure the new address is verified.",
          "If you are on a shared or public computer, always sign out when finished.",
        ],
        avoid: [
          "Submitting multiple password reset requests in quick succession. This can temporarily lock your account.",
          "Using the same password across multiple sites. A breach on another site could affect your Plugr account.",
        ],
      },
      {
        heading: "Profile not updating or saving",
        content:
          "If your profile changes are not appearing after you save them, the issue is usually a browser cache or a network interruption during the save.",
        steps: [
          "Refresh the page after saving to confirm the changes persisted.",
          "If changes did not save, try saving again with a stable internet connection.",
          "Clear your browser cache if the page keeps showing old data.",
          "Check that all required fields are filled in. Missing required fields prevent saving.",
          "Try a different browser or device to rule out a local issue.",
        ],
        bestPractices: [
          "Save your profile changes before navigating away from the page.",
          "If you are editing on mobile, make sure you have a stable connection before saving.",
        ],
        avoid: [
          "Editing the same profile in multiple browser tabs simultaneously. This can cause data conflicts.",
          "Closing the browser immediately after saving. Give it a moment to complete the request.",
        ],
      },
      {
        heading: "Image upload failures",
        content:
          "If your profile photo or product images fail to upload, the issue is usually related to file size or format.",
        steps: [
          "Check that the file is under 5MB. Larger files will be rejected.",
          "Use JPEG, PNG, WebP, or GIF formats. Other formats are not supported.",
          "If the file is too large, compress it using a free online tool before uploading.",
          "Try uploading a different image to rule out a corrupted file.",
          "On mobile, make sure you have granted the browser permission to access your photo library.",
        ],
        bestPractices: [
          "Resize images to around 800\u20131200 pixels wide before uploading. This keeps quality high while staying under the size limit.",
          "Use JPEG for photos and PNG for graphics with transparency.",
        ],
        avoid: [
          "Uploading RAW camera files or HEIC format without converting first.",
          "Trying to upload the same failed image repeatedly. Try a different file to isolate the issue.",
        ],
      },
      {
        heading: "Notifications not appearing",
        content:
          "If you are not receiving notifications for messages, reviews, or other activity, check your notification settings and browser permissions.",
        steps: [
          "Make sure you are logged in. Notifications only work for authenticated sessions.",
          "Check your browser notification settings. Some browsers block notifications by default.",
          "Refresh the page to force a reconnection to the notification system.",
          "If you recently logged in from a new device, notifications may take a moment to sync.",
        ],
      },
      {
        heading: "When to contact support",
        content:
          "If the steps above do not resolve your issue, contact support through the live chat widget or by emailing contact@useplugr.app. To help us resolve your issue faster, include the following in your message:",
        steps: [
          "The page or feature where the issue occurred.",
          "What you clicked or did just before the problem started.",
          "Any error messages you saw (screenshots are very helpful).",
          "Your device type (phone, tablet, or computer) and browser (Chrome, Safari, etc.).",
          "Whether the issue happens every time or only occasionally.",
        ],
        bestPractices: [
          "One support message per issue is enough. Multiple messages for the same problem slow down the queue.",
          "Be as specific as possible. \u201cThe profile page is broken\u201d is harder to fix than \u201cThe Save button on the profile edit page does not respond when I tap it.\u201d",
          "Check the status of known issues on our X/Twitter account (@useplugr) before reporting.",
        ],
        avoid: [
          "Sending identical follow-up messages. Support will respond as soon as possible.",
          "Changing multiple profile fields at once while trying to diagnose a bug. Isolate one change at a time.",
        ],
      },
    ],
    relatedSlugs: ["getting-started"],
  },
];

export const helpFaqs: HelpFaq[] = [
  { question: "Do I need to verify my email before using Plugr?", answer: "Yes. Email verification is mandatory before your account becomes active. Without it, you cannot appear in search results, contact other users, or receive messages. A verification code is sent to your registered school email immediately after signup. The code expires in 15 minutes.", tags: ["getting started", "account", "email"] },
  { question: "How is my credibility score calculated?", answer: "Your credibility score (0\u2013100) is calculated from three components: profile setup (up to 30 points), verification status (20 points when verified), and reviews (up to 50 points). Profile and verification are entirely within your control. Reviews require sustained, genuine work over time.", tags: ["credibility", "scoring", "system"] },
  { question: "How many points does each part contribute?", answer: "Profile setup and verified badge together account for 50 points. Reviews account for the other 50. A fully complete and verified profile can reach the 50-point maximum from that pillar alone. Reviews require sustained, genuine work over weeks and months to build up.", tags: ["credibility", "scoring", "breakdown"] },
  { question: "How much does each review add to my score?", answer: "Each review adds between 0.5 and 2.5 points depending on the rating: 1 star = 0.5 points, 2 stars = 1.0, 3 stars = 1.5, 4 stars = 2.0, 5 stars = 2.5. These points are multiplied by the reviewer's credibility weight. The total review score is capped at 50 points.", tags: ["credibility", "reviews", "scoring"] },
  { question: "What do the credibility colors mean?", answer: "0\u201310 (Critical, red): incomplete or new account. 11\u201320 (Low, orange): partially complete or newly verified. 21\u201330 (Moderate, yellow): complete profile with some reviews. 31\u201360 (Good, amber): verified with solid review history. 61\u2013100 (Excellent, green): fully verified with many positive reviews over time.", tags: ["credibility", "colors", "ranges"] },
  { question: "How long does it take to build credibility?", answer: "Credibility is intentionally a long-term metric. A complete profile plus verification can get you to 50 points quickly. The remaining 50 points from reviews require sustained, genuine work over weeks and months. There are no shortcuts by design.", tags: ["credibility", "time", "reputation"] },
  { question: "Why did my verification badge change to pending?", answer: "Significant profile changes, especially name or photo updates, automatically send your badge back under review. This ensures the verified badge remains trustworthy. During the review period, your badge shows as \u201cPending\u201d until the changes are verified.", tags: ["verification", "badge", "review"] },
  { question: "How do I get found faster in Discover?", answer: "Complete your profile fully, get verified, keep your location current, and build positive reviews over time. The ranking algorithm prioritizes verification status, credibility score, profile recency, and search relevance. Higher credibility and consistent updates improve your position in results.", tags: ["discover", "exposure", "credibility"] },
  { question: "Can I be both a buyer and a provider?", answer: "Yes. Plugr supports Provider, Requester, or Both modes. Select \u201cBoth\u201d if you want to offer services and request them from other students using a single account.", tags: ["account", "mode", "provider"] },
  { question: "Who can launch a store on Plugr?", answer: "Only verified providers can launch a store. Once your verification badge is approved, you can set up your store from the Stores page \u2014 give it a name, tagline, banner, logo, and WhatsApp number.", tags: ["stores", "store", "seller"] },
  { question: "How do I set up my store?", answer: "Open the Stores page and tap Set up your store. Enter a store name, tagline, description, upload a banner and logo, and add your WhatsApp number. Your store gets its own public page at /stores/your-store-name.", tags: ["stores", "store", "setup"] },
  { question: "How do I add products to my store?", answer: "Open Stores \u2192 My store and tap Add product. Enter a name, category, price, description, and up to 8 photos. The product appears on your storefront immediately.", tags: ["stores", "products", "listing"] },
  { question: "How do I buy a product from a store?", answer: "Open the product and tap Buy Now. Plugr opens a WhatsApp chat with the provider where you confirm the order, price, and pickup or delivery. Payments happen off-platform between you and the provider.", tags: ["stores", "buy", "whatsapp"] },
  { question: "Can I delete my store?", answer: "Yes. From Stores \u2192 My store, tap Delete store. This permanently removes your store and all of its products. This cannot be undone, so make sure you have no pending orders first.", tags: ["stores", "store", "delete"] },
  { question: "Do I earn credibility points for my store?", answer: "Yes. Launching your store is part of your profile setup score and is worth 5 credibility points, even before you add any products.", tags: ["stores", "credibility", "points"] },
  { question: "What should I send when reporting a bug?", answer: "Include the page name, what you clicked, what happened, and a screenshot if possible. The more specific you are, the faster support can identify and fix the issue.", tags: ["support", "bug", "troubleshooting"] },
];

export const supportLinks = [
  { title: "Email support", value: "contact@useplugr.app", href: "mailto:contact@useplugr.app", description: "Best for account, verification, and technical issues." },
  { title: "Live chat", value: "Start live chat", href: "#live-chat", description: "Use this for urgent questions and quick support requests." },
  { title: "X / Twitter", value: "@useplugr", href: "https://x.com/useplugr", description: "For updates, announcements, and lightweight support nudges." },
];

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return helpArticles.find((a) => a.slug === slug);
}

export function getRelatedArticles(article: HelpArticle): HelpArticle[] {
  return article.relatedSlugs
    .map((slug) => helpArticles.find((a) => a.slug === slug))
    .filter((a): a is HelpArticle => Boolean(a));
}

export function estimateReadingTime(article: HelpArticle): number {
  const text = [article.intro, ...article.sections.map((s) => s.heading + " " + (s.content || "") + " " + (s.steps || []).join(" ") + " " + (s.bestPractices || []).join(" ") + " " + (s.avoid || []).join(" "))].join(" ");
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
