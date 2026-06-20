export function LoadingState({ label = 'Loading workspace...' }: { label?: string }) {
  return <div className="page-state"><span className="loader" />{label}</div>
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="page-state error-state">
      <strong>Could not reach the local API.</strong>
      <span>{message}</span>
      {retry ? <button onClick={retry}>Try again</button> : null}
    </div>
  )
}
