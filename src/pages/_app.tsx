type MyAppType = {
  Component: any,
  pageProps: any
}

function MyApp({ Component, pageProps }: MyAppType) {
  return (
    <div>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
