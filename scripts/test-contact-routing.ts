import { prisma } from "../src/lib/prisma"
import { getContactFormRecipient } from "../src/lib/contact-actions"

async function verifyContactRecipient() {
  const recipientSetting = await prisma.parametreSite.findUnique({
    where: { key: "contact_form_recipient" },
    select: { value: true },
  })
  const recipient = await getContactFormRecipient()
  const configuredRecipient = recipientSetting?.value?.trim()

  if (configuredRecipient && recipient !== configuredRecipient) {
    throw new Error("The contact form does not use its configured primary recipient.")
  }

  console.log(`Contact form primary recipient verified: ${recipient}`)
}

verifyContactRecipient()
  .catch((error) => {
    console.error("Contact recipient verification failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
