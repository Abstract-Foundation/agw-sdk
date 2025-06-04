import type { EIP1193Provider } from 'viem';

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}
class EIP6963AnnounceProviderEvent extends CustomEvent<EIP6963ProviderDetail> {
  constructor(detail: EIP6963ProviderDetail) {
    super('eip6963:announceProvider', { detail });
  }
}

function announceProvider() {
  const info: EIP6963ProviderInfo = {
    uuid: '2306fd26-fcfb-4f9e-87da-0d1e237e917c',
    name: 'Abstract Global Wallet',
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
    rdns: 'xyz.abs.privy',
  };
  window.dispatchEvent(
    new EIP6963AnnounceProviderEvent({
      info,
      provider,
    }),
  ),
}

if (typeof window !== 'undefined') {
  window.addEventListener('eip6963:requestProvider', () => { announceProvider() });
}
