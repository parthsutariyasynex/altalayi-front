"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { NotificationsResponse, NotificationItem } from "../types";

export function useNotifications() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async (pageSize = 15, currentPage = 1) => {
        const token = (session as any)?.accessToken;
        if (!token) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/kleverapi/notifications?pageSize=${pageSize}&currentPage=${currentPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch notifications");
            }

            const data: any = await response.json();
            console.log("[useNotifications] Raw API response:", JSON.stringify(data).substring(0, 500));

            // Robustly check for the list of notifications
            // Magento may wrap in different structures
            const items = Array.isArray(data) ? data
                : data.items || data.notifications || data.data || [];
            console.log("[useNotifications] Parsed items count:", items.length);

            setNotifications(items);
            setUnreadCount(data.unread_count ?? data.unreadCount ?? 0);
            setTotalCount(data.total_count ?? data.totalCount ?? items.length);
        } catch (err: any) {
            setError(err.message);
            console.error("Error fetching notifications:", err);
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    const markAsRead = useCallback(async (notificationId: number) => {
        const token = (session as any)?.accessToken;
        if (!token) return false;

        try {
            const response = await fetch(`/api/kleverapi/notifications/${notificationId}/read`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const resData = await response.json().catch(() => null);
            console.log("[markAsRead] ID:", notificationId, "Status:", response.status, "Response:", resData);

            if (response.ok) {
                // Update local state and decrease unread count in one pass
                setNotifications(prev => {
                    const item = prev.find(i => i.notification_id === notificationId);
                    if (item && !item.is_read) {
                        setUnreadCount(count => Math.max(0, count - 1));
                    }
                    return prev.map(item =>
                        item.notification_id === notificationId
                            ? { ...item, is_read: true }
                            : item
                    );
                });

                // Sync navbar bell icon
                window.dispatchEvent(new CustomEvent("notifications-updated"));
                return true;
            } else {
                console.warn("[markAsRead] Failed for ID:", notificationId, resData);
            }
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
        return false;
    }, [session]);

    const removeNotification = useCallback(async (notificationId: number, isRead: boolean) => {
        const token = (session as any)?.accessToken;
        if (!token) return;

        try {
            // Mark as read first if it's currently unread
            if (!isRead) {
                await markAsRead(notificationId);
            }

            // Call the remove API on the server
            const response = await fetch(`/api/kleverapi/notifications/${notificationId}/remove`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const resData = await response.json().catch(() => null);
            console.log("[removeNotification] Status:", response.status, "Response:", resData);

            if (!response.ok) {
                console.warn("Server-side removal failed for notification:", notificationId, resData);
            }

            // Re-fetch from server to get accurate state after removal
            await fetchNotifications();

            // Sync navbar bell icon
            window.dispatchEvent(new CustomEvent("notifications-updated"));
        } catch (err) {
            console.error("Error removing notification:", err);
        }
    }, [session, markAsRead, fetchNotifications]);

    return {
        notifications,
        unreadCount,
        totalCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        removeNotification
    };
}
