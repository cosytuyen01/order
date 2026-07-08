const PHONE_DOMAIN = 'phone.order.app'

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('84') && digits.length === 11) return digits
  if (digits.startsWith('0') && digits.length === 10) return `84${digits.slice(1)}`
  if (digits.length === 9) return `84${digits}`
  return digits
}

export function isValidVietnamesePhone(input: string): boolean {
  return /^84[3-9]\d{8}$/.test(normalizePhone(input))
}

export function phoneToAuthEmail(phone: string): string {
  return `${normalizePhone(phone)}@${PHONE_DOMAIN}`
}

export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhone(phone)
  if (/^84[3-9]\d{8}$/.test(normalized)) {
    return `0${normalized.slice(2)}`
  }
  return phone
}

export function formatPhoneFromAuthEmail(email: string | null | undefined): string {
  if (!email) return ''
  const match = email.match(/^(\d+)@phone\./)
  if (!match) return email
  return formatPhoneDisplay(match[1])
}
