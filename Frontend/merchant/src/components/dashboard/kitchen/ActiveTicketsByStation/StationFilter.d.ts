import { KitchenStation } from '@/types/kitchen';
interface StationFilterProps {
    stations: KitchenStation[];
    selectedStation: string;
    onChange: (stationId: string) => void;
}
/**
 * StationFilter Component
 *
 * Dropdown filter for selecting kitchen station
 */
export declare function StationFilter({ stations, selectedStation, onChange, }: StationFilterProps): import("react/jsx-runtime").JSX.Element;
export {};
