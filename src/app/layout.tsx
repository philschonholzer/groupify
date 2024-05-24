import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Groupli App',
	description: 'Pairing people in groups',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={`${inter.className} container max-w-3xl mx-auto my-12`}>
				{children}
			</body>
		</html>
	)
}
