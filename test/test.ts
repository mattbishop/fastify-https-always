import test from "tape"
import Fastify from "fastify"
import {fetch} from "undici"
import httpsAlwaysPlugin, {HttpsAlwaysOptions} from "../src"


// self-signed testing cert
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const URL = "/a/url?qp=hi"

test("Tests for https-always", async (t) => {
  const https = Fastify({
    https: {
      key:  httpsKey,
      cert: httpsCert
    }
  })
  await https.listen({port: 3443})

  process.env.NODE_ENV = "production"
  const defaultsPort = 3080
  const httpDefaults = await createHttpServer(defaultsPort, false, {})

  t.plan(9)
  let result = await fetch(`http://localhost:${defaultsPort}${URL}`, {redirect: "manual"})
  t.equal(result.status, 301, "http Permanently Moved")
  t.equal(result.headers.get("location"), `https://localhost${URL}`, "Location is https with no port")

  const trustProxyPort = 3081
  const httpTrustProxy = await createHttpServer(trustProxyPort, true, {httpsPort: 443})

  result = await fetch(`http://localhost:${trustProxyPort}${URL}`, {
    redirect: "manual",
    headers: {
      "x-forwarded-proto":  "https",
      "x-forwarded-host":   "localhost:3443"
    }
  })
  t.equal(result.status, 404, "http with proxy headers Not Found")

  result = await fetch(`http://localhost:${trustProxyPort}${URL}`, {redirect: "manual"})
  t.equal(result.status, 301, "http Permanently Moved")
  t.equal(result.headers.get("location"), `https://localhost:443${URL}`, "Location is https with port")

  const disallowPort = 3082
  const httpDisallow = await createHttpServer(disallowPort, false, {redirect: false})
  result = await fetch(`http://localhost:${disallowPort}${URL}`, {redirect: "manual"})
  t.equal(result.status, 403, "http HTTPS Required")

  process.env.NODE_ENV = "development"
  const devModePort = 3083
  const httpDevMode = await createHttpServer(devModePort, false, {productionOnly: false})
  result = await fetch(`http://localhost:${devModePort}${URL}`, {redirect: "manual"})
  t.equal(result.status, 301, "http dev mode Permanently Moved")
  t.equal(result.headers.get("location"), `https://localhost${URL}`, "Location is https with no port")

  const prodOnlyPort = 3084
  const httpProdOnly = await createHttpServer(prodOnlyPort, false, {productionOnly: true})
  result = await fetch(`http://localhost:${prodOnlyPort}${URL}`, {redirect: "manual"})
  t.equal(result.status, 404, "http prodOnly Not Found")

  await Promise.all([
    https.close(),
    httpDefaults.close(),
    httpTrustProxy.close(),
    httpDevMode.close(),
    httpProdOnly.close(),
    httpDisallow.close()
  ])
})


async function createHttpServer(port: number, trustProxy: boolean, opts: HttpsAlwaysOptions) {
  const http = Fastify({
    trustProxy
  })
  http.register(httpsAlwaysPlugin, opts)
  await http.listen({port})
  await http.ready()

  return http
}



const httpsKey = `-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAMIiJAhpsXD5D/+5
owjvdgez8Nqm0KLIkld/nVNwzWAVnY12IhkC7hioqRRQCHhPNFElpGVBz3wLWWCj
+koq69yuYiPZljmcBYK/r5JGwG+FFeVVqHjGNAVEbRH6Zvaz3aEqLyOj9wT/F5pJ
BtIPZC1IgTrOw3xS2TjwN/FqL++HAgMBAAECgYAKOnxFiTQVLLpAEgraBKvmWf+9
tX5WpVS4kXu7krzvbBQiCPBg+vuKhxBphpH7rMin4eDYiPAirAJoihs83ygQIA4B
194dSD1irNBJy62Po4IXA8f0tLCESk1V+bfLBC0RsyIqGOFI5yCj3VRYPEGAYHYY
DprEE2JOhBgjRacneQJBAOAsK26Pknp/OXZSs9FqCOHeZPdA95XkQ+gNChCyzbkk
a9VIVsKlDe2OUPVzEYQ3QjpddTQshboDMwYKEW+HFO0CQQDdsijp9EFjA3AxyhqW
TXsYOjSu2MCHe1mnlEcmJMvKKA3y+YpM8NwgLOkY2BDdfRbMtvjuFSurRKUiZtw2
rhvDAkAmR4SXGY8iuczfJposHVYs86P8EKz2fIcX/foFBfNZNR3wyqx+Cl9JfG7Y
qvCHykPV4ZWc9ilTrS4uTtPRXpi1AkEAzc6e/NGsAecnOJGOrQmwxIUEc2z1DtEM
Ie4dPuPZ7AnTKUVPhq3zLEuE+XNb9MIzcEhMP3mX2J8ZTh5/QKPRUQJBAM0pYbRu
GXlfei3LnTUrSAdIRyc06i3zkWygQztYVJyRodS2vRnhwBTL5MtrgWR5ALKuaAul
TorrsW76xKLvxec=
-----END PRIVATE KEY-----`

const httpsCert = `-----BEGIN CERTIFICATE-----
MIICtjCCAh8CFET/HQXpZC6h7CyE2IgC/edV8gsZMA0GCSqGSIb3DQEBCwUAMIGY
MQswCQYDVQQGEwJDQTEZMBcGA1UECAwQQnJpdGlzaCBDb2x1bWJpYTESMBAGA1UE
BwwJVmFuY291dmVyMR0wGwYDVQQKDBRmYXN0aWZ5LWh0dHBzLWFsd2F5czE7MDkG
A1UEAwwyaHR0cHM6Ly9naXRodWIuY29tL21hdHRiaXNob3AvZmFzdGlmeS1odHRw
cy1hbHdheXMwIBcNMjIwODE0MjE1OTU4WhgPMjI5NjA1MjgyMTU5NThaMIGYMQsw
CQYDVQQGEwJDQTEZMBcGA1UECAwQQnJpdGlzaCBDb2x1bWJpYTESMBAGA1UEBwwJ
VmFuY291dmVyMR0wGwYDVQQKDBRmYXN0aWZ5LWh0dHBzLWFsd2F5czE7MDkGA1UE
AwwyaHR0cHM6Ly9naXRodWIuY29tL21hdHRiaXNob3AvZmFzdGlmeS1odHRwcy1h
bHdheXMwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAMIiJAhpsXD5D/+5owjv
dgez8Nqm0KLIkld/nVNwzWAVnY12IhkC7hioqRRQCHhPNFElpGVBz3wLWWCj+koq
69yuYiPZljmcBYK/r5JGwG+FFeVVqHjGNAVEbRH6Zvaz3aEqLyOj9wT/F5pJBtIP
ZC1IgTrOw3xS2TjwN/FqL++HAgMBAAEwDQYJKoZIhvcNAQELBQADgYEAu588Rxko
Y994JB9IowC5AWzFLSTm4fzp80JQc1Bv9IapeFxvBucumYEDmQN/opOEcBmzYqRb
iCBkNwSchMbPKWdD0oCU0lIA5CC3jGfKPyFUaFS7RDtDE9GjKHf9iexFxPMNBR3a
kjYW4mD0WOKNcXVIvYfRYtYimf0lyE0Fn9k=
-----END CERTIFICATE-----`
