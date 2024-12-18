import Image from 'next/image'

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCode({ value, size = 200 }: QRCodeProps) {
  const url = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(value)}`
  
  return (
    <Image 
      src={url} 
      alt="QR Code"
      width={size}
      height={size}
      className="border rounded-lg"
      unoptimized
    />
  )
}