import { Cormorant_Garamond, EB_Garamond, DM_Sans, Encode_Sans_Expanded } from "next/font/google"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
})

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
})

const encodeSansExpanded = Encode_Sans_Expanded({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-logo",
})

export const metadata = {
  title: "Threshold — A cabinet of architectural curiosities",
  description: "Curated search for architecturally significant homes.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${ebGaramond.variable} ${dmSans.variable} ${encodeSansExpanded.variable}`}>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
