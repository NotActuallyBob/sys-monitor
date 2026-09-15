export type CpuCoreData = {
    name: string;
    cpu_usage: number;
};

export type SystemData = {
    cpu_usage: number;
    memory_used: number;
    memory_total: number;
    cores: CpuCoreData[];
};

export type SystemDataRecord = {
    timestamp: Date;
    stats: SystemData;
};