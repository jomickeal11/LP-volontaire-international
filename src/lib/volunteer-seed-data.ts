import translations from "@/i18n/translations"

const LANGUAGES = ["FR", "EN", "DE"] as const

export function getInitialVolunteerEditorialSettings(): Record<string, string> {
  const settings: Record<string, string> = {
    volunteer_hero_image: "/hero-volunteer-collab.jpg",
    volunteer_build_featured_image:
      "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=1200&q=80",
  }

  for (const lang of LANGUAGES) {
    const t = translations[lang]
    const suffix = lang.toLowerCase()
    const add = (key: string, value: unknown) => {
      settings[`${key}_${suffix}`] = typeof value === "string" ? value : ""
    }

    add("volunteer_hero_badge", t.hero.badge)
    add("volunteer_hero_line1", t.hero.line1)
    add("volunteer_hero_line2", t.hero.line2)
    add("volunteer_hero_line3", t.hero.line3)
    add("volunteer_hero_desc", t.hero.desc)
    add("volunteer_hero_cta_primary", t.hero.cta1)
    add("volunteer_hero_cta_secondary", t.hero.cta2)
    add("volunteer_hero_stat1_label", t.hero.stat1Label)
    add("volunteer_hero_stat1_sub", t.hero.stat1Sub)
    add("volunteer_hero_stat2_label", t.hero.stat2Label)
    add("volunteer_hero_stat2_sub", t.hero.stat2Sub)
    add("volunteer_hero_stat3_label", t.hero.stat3Label)
    add("volunteer_hero_stat3_sub", t.hero.stat3Sub)

    add("volunteer_why_tag", t.whyMission.tag)
    add("volunteer_why_title", t.whyMission.title)
    t.whyMission.cards.forEach((card, index) => {
      const key = `volunteer_why_card${index + 1}`
      add(`${key}_title`, card.title)
      add(`${key}_desc`, card.desc)
    })

    add("volunteer_challenge_tag", t.challenge.tag)
    add("volunteer_challenge_title", t.challenge.title)
    add("volunteer_challenge_p1", t.challenge.p1)
    add("volunteer_challenge_p2", t.challenge.p2)

    t.challenge.steps.forEach((step, index) => {
      const key = `volunteer_challenge_step${index + 1}`
      add(`${key}_tag`, step.tag)
      add(`${key}_title`, step.title)
      add(`${key}_text`, step.text)
    })

    add("volunteer_mission_tag", t.mission.tag)
    add("volunteer_mission_title", t.mission.title)
    t.mission.steps.forEach((step, index) => {
      const key = `volunteer_mission_step${index + 1}`
      add(`${key}_title`, step.title)
      add(`${key}_desc`, step.desc)
    })

    add("volunteer_build_tag", t.build.tag)
    add("volunteer_build_title", t.build.title)
    add("volunteer_build_featured_badge", t.build.featured.badge)
    add("volunteer_build_featured_title", t.build.featured.title)
    add("volunteer_build_featured_desc", t.build.featured.desc)

    t.build.cards.forEach((card, index) => {
      const key = `volunteer_build_card${index + 1}`
      add(`${key}_badge`, card.badge)
      add(`${key}_title`, card.title)
      add(`${key}_desc`, "desc" in card ? card.desc : "")
    })

    t.profiles.categories.forEach((category, index) => {
      const key = `volunteer_profiles_category${index + 1}`
      add(`${key}_title`, category.title)
      add(`${key}_tags`, category.tags)
    })
    add("volunteer_profiles_tag", t.profiles.tag)
    add("volunteer_profiles_title", t.profiles.title)
    add("volunteer_profiles_subtitle", t.profiles.subtitle)
    add("volunteer_profiles_eligibility_cta", t.profiles.cta)
    add("volunteer_profiles_nonexpert_title", t.notExpert.title)
    add("volunteer_profiles_nonexpert_subtitle", t.notExpert.subtitle)
    t.notExpert.qualities.forEach((quality, index) => {
      add(`volunteer_profiles_nonexpert_quality${index + 1}`, quality)
    })

    add("volunteer_togo_tag", t.lifeInTogo.tag)
    add("volunteer_togo_title", t.lifeInTogo.title)
    add("volunteer_togo_desc", t.lifeInTogo.desc)

    add("volunteer_conditions_tag", t.support.tag)
    add("volunteer_conditions_title", t.support.title)
    add("volunteer_conditions_subtitle", t.support.subtitle)

    add("volunteer_process_tag", t.appProcess.tag)
    add("volunteer_process_title", t.appProcess.title)
    add("volunteer_process_subtitle", t.appProcess.subtitle)

    add("volunteer_cta_badge", t.finalCta.badge)
    add("volunteer_cta_title", t.finalCta.title)
    add("volunteer_cta_desc", t.finalCta.desc)
    add("volunteer_cta_btn_primary", t.finalCta.ctaVolunteer)
    add("volunteer_cta_btn_secondary", t.finalCta.ctaPartner)

    add("volunteer_week_tag", t.week.tag)
    add("volunteer_week_title", t.week.title)
    t.week.days.forEach((day, index) => {
      const key = `volunteer_week_day${index + 1}`
      add(`${key}_label`, t.week.dayLabels[index])
      add(`${key}_activity`, day.activity)
      add(`${key}_desc`, day.desc)
    })

    t.lifeInTogo.points.forEach((point, index) => {
      const key = `volunteer_togo_point${index + 1}`
      add(`${key}_title`, point.title)
      add(`${key}_desc`, point.desc)
    })

    add("volunteer_conditions_table_title", t.support.tableTitle)
    add("volunteer_conditions_table_summary", t.support.tableSummary)
    add("volunteer_conditions_status_confirmed", t.support.statusConfirmed)
    add("volunteer_conditions_status_pending", t.support.statusPending)
    t.support.tableItems.forEach(([label, detail, status], index) => {
      const key = `volunteer_conditions_row${index + 1}`
      add(`${key}_label`, label)
      add(`${key}_detail`, detail)
      add(`${key}_status`, status)
    })

    add("volunteer_process_step_label", t.appProcess.stepLabel)
    t.appProcess.steps.forEach((step, index) => {
      const key = `volunteer_process_step${index + 1}`
      add(`${key}_title`, step.title)
      add(`${key}_desc`, step.desc)
    })
    add("volunteer_process_cta", t.appProcess.cta)

    add("volunteer_faq_tag", t.faq.tag)
    add("volunteer_faq_title", t.faq.title)
    add("volunteer_faq_subtitle", t.faq.subtitle)
    t.faq.items.forEach((item, index) => {
      const key = `volunteer_faq_item${index + 1}`
      add(`${key}_question`, item.q)
      add(`${key}_answer`, item.a)
    })
    add("volunteer_faq_contact_title", t.faq.contactBoxTitle)
    add("volunteer_faq_contact_subtitle", t.faq.contactBoxSubtitle)
    add("volunteer_faq_whatsapp_text", t.faq.whatsappText)
  }

  return settings
}