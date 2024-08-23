<script setup lang="ts">
import { useGameStore } from "~/stores/gameStore";
import { computed, ref } from "vue";
import { TRANSACTION_ADDRESS } from "~/utils/constants";
import { Address } from "ton";

const gameStore = useGameStore();

const showComponent = ref(false);
const showModal = ref(false);
const newAddressName = ref("");
const newAddressValue = ref("");
const editingAddress = ref<string | null>(null);
const addressError = ref("");

const selectedAddress = computed({
  get: () => gameStore.selectedAddress,
  set: (value) => gameStore.setSelectedAddress(value),
});

const addressList = computed(() => {
  return Object.entries(gameStore.savedAddresses).map(([name, address]) => ({
    name,
    address,
  }));
});

function toggleComponent() {
  showComponent.value = !showComponent.value;
}

function openAddModal() {
  newAddressName.value = "";
  newAddressValue.value = "";
  editingAddress.value = null;
  addressError.value = "";
  showModal.value = true;
}

function openEditModal(name: string, address: string) {
  newAddressName.value = name;
  newAddressValue.value = address;
  editingAddress.value = name;
  addressError.value = "";
  showModal.value = true;
}

function saveAddress() {
  if (newAddressName.value && newAddressValue.value) {
    if (isValidAddress(newAddressValue.value)) {
      if (editingAddress.value) {
        gameStore.removeAddress(editingAddress.value);
      }
      gameStore.addAddress(newAddressName.value, newAddressValue.value);
      showModal.value = false;
    } else {
      addressError.value = "Invalid address format";
    }
  }
}

function removeAddress(name: string) {
  gameStore.removeAddress(name);
}

function isValidAddress(address: string): boolean {
  try {
    Address.parse(address);
    return true;
  } catch {
    return false;
  }
}

function closeModal() {
  showModal.value = false;
  newAddressName.value = "";
  newAddressValue.value = "";
  editingAddress.value = null;
  addressError.value = "";
}
</script>

<template>
  <div class="address-manager">
    <UButton
      @click="toggleComponent"
      size="lg"
      class="mb-4 w-full"
      :icon="
        showComponent ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
      "
    >
      {{ showComponent ? "Hide" : "Show" }} Address Manager
    </UButton>

    <div v-if="showComponent">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Address Manager</h2>
        <UButton @click="openAddModal" size="lg" icon="i-heroicons-plus">
          Add Address
        </UButton>
      </div>

      <div class="address-list">
        <div
          v-for="item in addressList"
          :key="item.name"
          class="mb-4 p-4 border rounded-lg shadow-sm"
        >
          <div class="mb-2">
            <div class="font-bold text-lg">{{ item.name }}</div>
            <div class="text-sm text-gray-600 break-all">
              {{ item.address }}
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mt-2">
            <UButton
              @click="() => gameStore.setSelectedAddress(item.address)"
              size="md"
              color="primary"
              class="flex-grow"
              :disabled="selectedAddress === item.address"
            >
              Select
            </UButton>
            <UButton
              @click="() => openEditModal(item.name, item.address)"
              size="md"
              color="gray"
              class="flex-grow"
            >
              Edit
            </UButton>
            <UButton
              @click="() => removeAddress(item.name)"
              size="md"
              color="red"
              class="flex-grow"
              :disabled="item.address === TRANSACTION_ADDRESS"
            >
              Delete
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <UModal v-model="showModal" fullscreen>
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">
            {{ editingAddress ? "Edit Address" : "Add New Address" }}
          </h3>
        </template>
        <UInput
          v-model="newAddressName"
          label="Address Name"
          placeholder="Enter a name for this address"
          class="mb-2"
        />
        <UInput
          v-model="newAddressValue"
          label="Address Value"
          placeholder="Enter the TON address"
          class="mb-2"
        />
        <p v-if="addressError" class="text-red-500 text-sm mb-2">
          {{ addressError }}
        </p>
        <template #footer>
          <div class="flex flex-col space-y-2">
            <UButton
              @click="saveAddress"
              :disabled="!newAddressName || !newAddressValue"
              size="lg"
              class="w-full flex items-center justify-center"
            >
              Save
            </UButton>
            <UButton
              @click="closeModal"
              size="lg"
              color="gray"
              class="w-full flex items-center justify-center"
            >
              Cancel
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<style scoped>
.address-manager {
  max-width: 100%;
  overflow-x: hidden;
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 640px) {
  .address-list {
    max-height: none;
  }
}
</style>
