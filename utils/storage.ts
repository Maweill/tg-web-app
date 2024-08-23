export function getAddressesFromStorage(): Record<string, string> {
  const addresses = localStorage.getItem("savedAddresses");
  return addresses ? JSON.parse(addresses) : {};
}

export function saveAddressesToStorage(addresses: Record<string, string>) {
  localStorage.setItem("savedAddresses", JSON.stringify(addresses));
}
