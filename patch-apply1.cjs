const fs = require('fs');

let content = fs.readFileSync('src/views/ApplyPage.tsx', 'utf-8');

// Add import
content = content.replace(
  'import type { Page, Language } from "../types"',
  'import type { Page, Language } from "../types"\nimport translations from "../i18n/translations"'
);

// Add const t
content = content.replace(
  'export default function ApplyPage({ lang, navigate }: ApplyPageProps) {\n  const [step, setStep] = useState(1)',
  'export default function ApplyPage({ lang, navigate }: ApplyPageProps) {\n  const t = translations[lang] || translations.EN\n  const [step, setStep] = useState(1)'
);

// Replace STEPS
content = content.replace(
  /const STEPS = \[\n\s+\{ num: 1, label: "Personal Info" \},[\s\S]*?\{ num: 9, label: "Summary" \},\n\]/,
  `// STEPS is now dynamic inside the component or we map it`
);

content = content.replace(
  /\{STEPS\.slice\(0, 8\)\.map\(\(s\) => \(/,
  `{[
            { num: 1, label: t.apply.steps.s1 },
            { num: 2, label: t.apply.steps.s2 },
            { num: 3, label: t.apply.steps.s3 },
            { num: 4, label: t.apply.steps.s4 },
            { num: 5, label: t.apply.steps.s5 },
            { num: 6, label: t.apply.steps.s6 },
            { num: 7, label: t.apply.steps.s7 },
            { num: 8, label: t.apply.steps.s8 },
            { num: 9, label: t.apply.steps.s9 },
          ].slice(0, 8).map((s) => (`
);

// Replace SKILLS
content = content.replace(
  /const SKILLS = \[\n\s+\{ label: "Computer Science", slug: "computer-science" \},[\s\S]*?\{ label: "Project Management", slug: "project-management" \},\n\s+\]/,
  `const SKILLS = [
    { label: "Computer Science", slug: "computer-science" },
    { label: "Data Science", slug: "data" },
    { label: "Web Development", slug: "web-development" },
    { label: "Mobile Development", slug: "mobile-development" },
    { label: "Cybersecurity", slug: "cybersecurity" },
    { label: "Agriculture", slug: "agriculture" },
    { label: "Graphic Design", slug: "graphic-design" },
    { label: "Communication", slug: "communication" },
    { label: "Content Creation", slug: "content-creation" },
    { label: "Arduino", slug: "arduino" },
    { label: "Raspberry Pi", slug: "raspberry-pi" },
    { label: "IoT", slug: "iot" },
    { label: "Digital Education", slug: "digital-education" },
    { label: "Project Management", slug: "project-management" },
  ]`
);

// Replace form fields
content = content.replace(/label="First Name"/g, 'label={t.apply.form.firstName}');
content = content.replace(/placeholder="Maria"/g, 'placeholder={t.apply.form.firstNamePlaceholder}');
content = content.replace(/label="Last Name"/g, 'label={t.apply.form.lastName}');
content = content.replace(/placeholder="Dupont"/g, 'placeholder={t.apply.form.lastNamePlaceholder}');
content = content.replace(/label="Email"/g, 'label={t.apply.form.email}');
content = content.replace(/placeholder="maria@example\.com"/g, 'placeholder={t.apply.form.emailPlaceholder}');
content = content.replace(/label="Phone"/g, 'label={t.apply.form.phone}');
content = content.replace(/placeholder="\+33 6 12 34 56 78"/g, 'placeholder={t.apply.form.phonePlaceholder}');
content = content.replace(/label="Country"/g, 'label={t.apply.form.country}');
content = content.replace(/label="City"/g, 'label={t.apply.form.city}');
content = content.replace(/placeholder="Paris"/g, 'placeholder={t.apply.form.cityPlaceholder}');
content = content.replace(/label="Date of birth"/g, 'label={t.apply.form.dob}');
content = content.replace(/label="Level of education"/g, 'label={t.apply.form.education}');
content = content.replace(/placeholder="Master's in Computer Science"/g, 'placeholder={t.apply.form.educationPlaceholder}');
content = content.replace(/label="Field of study"/g, 'label={t.apply.form.field}');
content = content.replace(/placeholder="Computer Science"/g, 'placeholder={t.apply.form.fieldPlaceholder}');
content = content.replace(/label="Profession \/ current status"/g, 'label={t.apply.form.profession}');
content = content.replace(/placeholder="Student \/ Developer \/ Agronomist\.\.\."/g, 'placeholder={t.apply.form.professionPlaceholder}');

// Fix validations in submit
content = content.replace(/"Veuillez renseigner votre prénom \(au moins 2 caractères\)\."/g, 't.apply.errors.firstNameReq');
content = content.replace(/"Veuillez renseigner votre nom \(au moins 2 caractères\)\."/g, 't.apply.errors.lastNameReq');
content = content.replace(/"Veuillez renseigner une adresse e-mail valide\."/g, 't.apply.errors.emailInvalid');
content = content.replace(/"Veuillez sélectionner un pays\."/g, 't.apply.errors.countryReq');
content = content.replace(/"Veuillez renseigner votre date de naissance\."/g, 't.apply.errors.dobReq');
content = content.replace(/"Veuillez sélectionner au moins une compétence\."/g, 't.apply.errors.skillsReq');
content = content.replace(/"Veuillez détailler votre motivation \(au moins 20 caractères\)\."/g, 't.apply.errors.motivationLen');
content = content.replace(/"La motivation ne doit pas dépasser 5000 caractères\."/g, 't.apply.errors.motivationMax');
content = content.replace(/"Veuillez détailler votre expérience projet \(au moins 20 caractères\)\."/g, 't.apply.errors.projectLen');
content = content.replace(/"L'expérience projet ne doit pas dépasser 5000 caractères\."/g, 't.apply.errors.projectMax');
content = content.replace(/"Veuillez indiquer comment vous avez connu APTIC-R\."/g, 't.apply.errors.sourceReq');
content = content.replace(/"Veuillez accepter le traitement des données pour soumettre votre candidature\."/g, 't.apply.errors.consentReq');
content = content.replace(/"Une erreur est survenue lors de la soumission\."/g, 't.apply.errors.submitError');

fs.writeFileSync('src/views/ApplyPage.tsx', content, 'utf-8');
console.log('Successfully patched ApplyPage.tsx partially');
