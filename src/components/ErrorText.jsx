/**
 * Fejltekst med et ikon foran, så en fejl ikke kun adskiller sig med farve
 * (siden har ingen fejlfarve; teksten er sort og fed). Rollen (fx
 * role="alert") og id'et sendes med, så skærmlæsere læser den som i dag.
 * Ikonet er skjult for skærmlæsere; teksten siger selv, hvad der er galt.
 */
export default function ErrorText({ children, className = '', ...props }) {
  return (
    <p {...props} className={`error-text ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="10" cy="10" r="8.2" />
        <path d="M10 5.8v5.2" />
        <path d="M10 14.2v.01" strokeWidth="2.2" />
      </svg>
      <span>{children}</span>
    </p>
  )
}
