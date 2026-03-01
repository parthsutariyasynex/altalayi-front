"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses, deleteAddress, setDefaultAddress } from "@/store/actions/addressActions";
import { RootState } from "@/store/store";
import toast from "react-hot-toast";

type Address = {
  id: number | string;
  firstname?: string;
  lastname?: string;
  company?: string;
  street?: string[];
  city?: string;
  country_id?: string;
  region?: {
    region?: string;
  };
  postcode?: string;
  telephone?: string;
  default_billing?: boolean;
  default_shipping?: boolean;
};

type AddressCardProps = {
  title: string;
  address?: Address;
  onEdit?: (id: number | string) => void;
};

function AddressCard({ title, address, onEdit }: AddressCardProps) {
  return (
    <div className="flex flex-col h-full font-['Rubik']">
      <h3 className="font-semibold mb-2 text-gray-700 uppercase text-xs tracking-wider">{title}</h3>
      <div className="border border-gray-200 p-5 rounded-[3px] bg-white shadow-sm flex-grow">
        {address ? (
          <div className="space-y-1 text-sm text-gray-600">
            <p className="font-bold text-gray-900">
              {address.firstname} {address.lastname}
            </p>
            {address.company && <p>{address.company}</p>}
            <p>{address.street?.[0]}</p>
            <p>
              {address.city}, {address.region?.region ? `${address.region.region}, ` : ""}{address.country_id}
            </p>
            <p>{address.postcode}</p>
            <p className="pt-2">T: {address.telephone}</p>
            <button
              type="button"
              className="text-amber-600 mt-4 hover:text-amber-700 font-bold inline-flex items-center uppercase text-xs cursor-pointer hover:underline"
              onClick={() => onEdit?.(address.id)}
            >
              Change Address
            </button>
          </div>
        ) : (
          <p className="text-gray-400 italic text-sm">No default address set</p>
        )}
      </div>
    </div>
  );
}

export default function Addresses() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state: RootState) => state.address);
  const [search, setSearch] = useState("");
  const [openActionRowId, setOpenActionRowId] = useState<number | string | null>(null);
  const [selectedAddressIds, setSelectedAddressIds] = useState<Array<number | string>>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      const clickedInsideAction = targetElement.closest("[data-action-menu='true']");

      if (!clickedInsideAction) {
        setOpenActionRowId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenActionRowId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleAddressAction = async (action: string, addressId: number | string) => {
    if (action === "edit") {
      router.push(`/add-address?id=${addressId}`);
      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm("Are you sure you want to delete this address?");
      if (!confirmed) return;

      setActionLoading(true);
      // @ts-ignore
      dispatch(deleteAddress(addressId, (err) => {
        if (!err) {
          toast.success("Address deleted successfully");
        } else {
          toast.error(err || "Failed to delete address");
        }
        setActionLoading(false);
      }));
      return;
    }

    if (action === "set_default_billing") {
      setActionLoading(true);
      // @ts-ignore
      dispatch(setDefaultAddress({ addressId, type: "billing" }, (err) => {
        if (!err) {
          toast.success("Default billing address set");
        } else {
          toast.error(err || "Failed to set default billing");
        }
        setActionLoading(false);
      }));
      return;
    }

    if (action === "set_default_shipping") {
      setActionLoading(true);
      // @ts-ignore
      dispatch(setDefaultAddress({ addressId, type: "shipping" }, (err) => {
        if (!err) {
          toast.success("Default shipping address set");
        } else {
          toast.error(err || "Failed to set default shipping");
        }
        setActionLoading(false);
      }));
    }
  };

  const filteredAddresses = addresses.filter((address: any) =>
    `${address.firstname ?? ""} ${address.lastname ?? ""} ${address.city ?? ""} ${address.telephone ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const isAllFilteredSelected =
    filteredAddresses.length > 0 &&
    filteredAddresses.every((address: any) => selectedAddressIds.includes(address.id));

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedAddressIds((prev) =>
        prev.filter((id) => !filteredAddresses.some((address: any) => address.id === id))
      );
      return;
    }

    setSelectedAddressIds((prev) => {
      const next = [...prev];

      filteredAddresses.forEach((address: any) => {
        if (!next.includes(address.id)) {
          next.push(address.id);
        }
      });

      return next;
    });
  };

  const toggleSingleAddress = (addressId: number | string) => {
    setSelectedAddressIds((prev) =>
      prev.includes(addressId) ? prev.filter((id) => id !== addressId) : [...prev, addressId]
    );
  };

  const defaultBilling = addresses.find((address: any) => address.default_billing);
  const defaultShipping = addresses.find((address: any) => address.default_shipping);

  if (loading && addresses.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px] font-['Rubik']">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <p className="ml-3 text-gray-500 text-sm">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-['Rubik']">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Address Book</h2>
          <p className="text-gray-500 mt-1 text-sm">Manage your billing and shipping addresses</p>
        </div>

        <button
          type="button"
          className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-3 rounded-[3px] font-bold transition-all shadow-sm uppercase text-xs cursor-pointer active:scale-95"
          onClick={() => router.push("/add-address")}
          disabled={actionLoading}
        >
          Add New Address
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <AddressCard
          title="Default Billing Address"
          address={defaultBilling}
          onEdit={(id) => handleAddressAction("edit", id)}
        />
        <AddressCard
          title="Default Shipping Address"
          address={defaultShipping}
          onEdit={(id) => handleAddressAction("edit", id)}
        />
      </div>

      <div className="bg-white rounded-[3px] shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-50">
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            {filteredAddresses.length} {filteredAddresses.length === 1 ? 'record' : 'records'} found
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search addresses..."
              className="w-full border border-gray-300 px-4 py-2.5 rounded-[1px] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-gray-400 shadow-inner"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white text-gray-700 text-[11px] uppercase tracking-[0.1em] font-bold border-b border-gray-200">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    checked={isAllFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                  />
                </th>
                <th className="p-4 text-left whitespace-nowrap">First Name</th>
                <th className="p-4 text-left whitespace-nowrap">Last Name</th>
                <th className="p-4 text-left whitespace-nowrap">Street Address</th>
                <th className="p-4 text-left whitespace-nowrap">City</th>
                <th className="p-4 text-left whitespace-nowrap">Country</th>
                <th className="p-4 text-left whitespace-nowrap">State</th>
                <th className="p-4 text-left whitespace-nowrap">Zip</th>
                <th className="p-4 text-left whitespace-nowrap">Phone</th>
                <th className="p-4 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {filteredAddresses.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-gray-400 text-sm font-medium">
                    No addresses found matching your search.
                  </td>
                </tr>
              )}

              {filteredAddresses.map((address: any) => (
                <tr key={address.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                      checked={selectedAddressIds.includes(address.id)}
                      onChange={() => toggleSingleAddress(address.id)}
                    />
                  </td>
                  <td className="p-4 font-medium text-gray-900">{address.firstname}</td>
                  <td className="p-4 font-medium text-gray-900">{address.lastname}</td>
                  <td className="p-4 truncate max-w-[200px]">{address.street?.join(", ")}</td>
                  <td className="p-4">{address.city}</td>
                  <td className="p-4 font-bold text-gray-400 text-[11px]">{address.country_id}</td>
                  <td className="p-4">{address.region?.region || "-"}</td>
                  <td className="p-4 font-mono text-xs">{address.postcode}</td>
                  <td className="p-4 text-gray-500">{address.telephone}</td>

                  <td className="p-4 text-right relative" data-action-menu="true">
                    <button
                      type="button"
                      className="text-amber-600 hover:text-amber-700 font-bold text-xs uppercase transition-colors cursor-pointer"
                      onClick={() =>
                        setOpenActionRowId((prev) => (prev === address.id ? null : address.id))
                      }
                      disabled={actionLoading}
                    >
                      {actionLoading && openActionRowId === address.id ? '...' : 'Select'}
                    </button>

                    {openActionRowId === address.id && (
                      <div className="absolute right-4 mt-2 w-56 bg-white border border-gray-100 rounded-[2px] shadow-2xl z-20 overflow-hidden ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          <button
                            type="button"
                            className="block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                            onClick={() => handleAddressAction("edit", address.id)}
                          >
                            Edit Address
                          </button>

                          {!address.default_billing && (
                            <button
                              type="button"
                              className="block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                              onClick={() => handleAddressAction("set_default_billing", address.id)}
                            >
                              Set as Default Billing
                            </button>
                          )}

                          {!address.default_shipping && (
                            <button
                              type="button"
                              className="block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                              onClick={() => handleAddressAction("set_default_shipping", address.id)}
                            >
                              Set as Default Shipping
                            </button>
                          )}

                          <div className="border-t border-gray-100 mt-1">
                            <button
                              type="button"
                              className="block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              onClick={() => handleAddressAction("delete", address.id)}
                            >
                              Delete Address
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
