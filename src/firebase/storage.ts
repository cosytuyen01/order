import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './config'

export async function uploadStoreLogo(storeId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
  const storageRef = ref(storage, `stores/${storeId}/logo.${safeExt}`)
  await uploadBytes(storageRef, file, { contentType: file.type })
  return getDownloadURL(storageRef)
}
