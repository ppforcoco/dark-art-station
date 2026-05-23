// Minimal ambient declarations for the Trusted Types browser API.
// The full spec lives in @types/trusted-types but that package isn't
// installed. These stubs are enough for our hw-svg policy usage.

interface TrustedHTML {
  toString(): string;
}

interface TrustedTypePolicy {
  readonly name: string;
  createHTML(input: string, ...args: unknown[]): TrustedHTML;
  createScript?(input: string, ...args: unknown[]): TrustedScript;
  createScriptURL?(input: string, ...args: unknown[]): TrustedScriptURL;
}

interface TrustedTypePolicyOptions {
  createHTML?: (input: string, ...args: unknown[]) => string;
  createScript?: (input: string, ...args: unknown[]) => string;
  createScriptURL?: (input: string, ...args: unknown[]) => string;
}

interface TrustedTypePolicyFactory {
  createPolicy(name: string, options?: TrustedTypePolicyOptions): TrustedTypePolicy;
  isHTML(value: unknown): value is TrustedHTML;
  isScript(value: unknown): value is TrustedScript;
  isScriptURL(value: unknown): value is TrustedScriptURL;
  readonly defaultPolicy: TrustedTypePolicy | null;
  getAttributeType(
    tagName: string,
    attribute: string,
    elementNS?: string,
    attrNs?: string
  ): string | null;
}

interface TrustedScript {
  toString(): string;
}

interface TrustedScriptURL {
  toString(): string;
}

interface Window {
  trustedTypes?: TrustedTypePolicyFactory;
}
