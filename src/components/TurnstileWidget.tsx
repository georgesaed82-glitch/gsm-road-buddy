import { Turnstile } from "@marsidev/react-turnstile";
import { useEffect, useRef } from "react";

type Props = {
  siteKey: string;
  onToken: (token: string | null) => void;
};

/**
 * Renders the Cloudflare Turnstile widget. Managed mode picks invisible
 * challenges for humans and only shows a checkbox for suspicious traffic.
 */
export function TurnstileWidget({ siteKey, onToken }: Props) {
  const ref = useRef<any>(null);
  useEffect(() => {
    return () => onToken(null);
  }, [onToken]);
  return (
    <div className="flex justify-center">
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        options={{ theme: "light", size: "flexible" }}
        onSuccess={(t) => onToken(t)}
        onExpire={() => onToken(null)}
        onError={() => onToken(null)}
      />
    </div>
  );
}