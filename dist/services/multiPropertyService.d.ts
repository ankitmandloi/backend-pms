import type { PropertyGroup, PropertyProfile, PropertyFeatureFlags } from "../types/domain.js";
/**
 * Multi-Property Service
 * Handles multi-property operations:
 * - Property group management
 * - Feature flag management per property
 * - Cross-property reporting
 * - Centralized property switching
 */
export declare const multiPropertyService: {
    /**
     * Get all property groups
     */
    getPropertyGroups(): Promise<PropertyGroup[]>;
    /**
     * Get property group by ID
     */
    getPropertyGroupById(id: string): Promise<PropertyGroup>;
    /**
     * Create property group
     */
    createPropertyGroup(input: {
        name: string;
        description?: string;
        properties: string[];
    }): Promise<PropertyGroup>;
    /**
     * Update property group
     */
    updatePropertyGroup(id: string, updates: Partial<Omit<PropertyGroup, "id" | "createdAt" | "updatedAt">>): Promise<PropertyGroup>;
    /**
     * Delete property group
     */
    deletePropertyGroup(id: string): Promise<void>;
    /**
     * Get all properties
     */
    getAllProperties(): Promise<PropertyProfile[]>;
    /**
     * Get property by hotelId
     */
    getPropertyById(hotelId: string): Promise<PropertyProfile>;
    /**
     * Get properties in a group
     */
    getPropertiesInGroup(groupId: string): Promise<PropertyProfile[]>;
    /**
     * Get feature flags for a property
     */
    getPropertyFeatures(hotelId: string): Promise<PropertyFeatureFlags>;
    /**
     * Update feature flags for a property
     */
    updatePropertyFeatures(hotelId: string, features: Partial<PropertyFeatureFlags>): Promise<PropertyFeatureFlags>;
    /**
     * Check if feature is enabled for property
     */
    isFeatureEnabled(hotelId: string, feature: keyof PropertyFeatureFlags): Promise<boolean>;
    /**
     * Get properties with specific feature enabled
     */
    getPropertiesWithFeature(feature: keyof PropertyFeatureFlags): Promise<PropertyProfile[]>;
    /**
     * Get property statistics across all properties
     */
    getMultiPropertyStats(): Promise<{
        totalProperties: number;
        totalGroups: number;
        featureAdoption: Record<keyof PropertyFeatureFlags, number>;
    }>;
    /**
     * Switch context to different property (returns property details)
     */
    switchProperty(hotelId: string): Promise<PropertyProfile>;
};
