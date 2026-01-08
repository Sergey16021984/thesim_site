import React from 'react'

const BRAND = 'The SiM'

interface BrandTextProps {
  text: string
  className?: string
}

export default function BrandText({ text, className }: BrandTextProps) {
  if (!text.includes(BRAND)) {
    return <span className={className}>{text}</span>
  }

  const parts = text.split(BRAND)

  return (
    <span className={className}>
      {parts.map((part, index) => (
        <React.Fragment key={`${index}-${part}`}>
          {part}
          {index < parts.length - 1 ? (
            <span className="brand-gradient">{BRAND}</span>
          ) : null}
        </React.Fragment>
      ))}
    </span>
  )
}
