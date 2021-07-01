import * as React from "react";
import {ChakraProvider} from "@chakra-ui/react";
import Script from "next/script";
import {AppProps} from "next/app";

// apiKey: process.env.NEXT_PUBLIC_API_KEY,
// clientId: process.env.NEXT_PUBLIC_CLIENT_ID,

function App({Component, pageProps}: AppProps) {
  const [status, setStatus] = React.useState<"init" | "resolved" | "rejected">("init");
  const [error, setError] = React.useState<Error>(null);

  function handleAuthChange(isSignedIn: boolean) {
    setStatus(isSignedIn ? "resolved" : "rejected");
  }

  function handleGapiLoaded() {
    window.gapi.load("client:auth2", () =>
      window.gapi.client
        .init({
          apiKey: process.env.NEXT_PUBLIC_API_KEY,
          clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
          scope: "https://www.googleapis.com/auth/calendar",
        })
        .then(() => {
          window.gapi.auth2.getAuthInstance().isSignedIn.listen(handleAuthChange);

          handleAuthChange(window.gapi.auth2.getAuthInstance().isSignedIn.get());
        })
        .catch((error) => setError(error)),
    );
  }

  function handleSignIn() {
    window.gapi.auth2.getAuthInstance().signIn();
  }

  return (
    <ChakraProvider>
      {status === "init" && <span>Loading...</span>}
      {status === "resolved" && <Component {...pageProps} />}
      {status === "rejected" && (
        <>
          <button onClick={handleSignIn}>Iniciar sesión</button>
          {error && <span>{JSON.stringify(error)}</span>}
        </>
      )}
      <Script
        src="https://apis.google.com/js/api.js"
        strategy="afterInteractive"
        onLoad={handleGapiLoaded}
      />
    </ChakraProvider>
  );
}

export default App;
