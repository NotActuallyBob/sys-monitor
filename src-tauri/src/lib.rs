// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::Serialize;
use std::sync::Mutex;
use sysinfo::System;

static SYSTEM: Mutex<Option<System>> = Mutex::new(None);

#[derive(Serialize)]
pub struct CpuCoreData {
    name: String,
    cpu_usage: f32,
}

#[derive(Serialize)]
pub struct SystemData {
    cpu_usage: f32,
    memory_used: u64,
    memory_total: u64,
    cores: Vec<CpuCoreData>,
}

#[tauri::command]
fn get_system_stats() -> SystemData {
    let mut system = SYSTEM.lock().unwrap();
    let sys = system.get_or_insert_with(System::new_all);

    sys.refresh_cpu();
    sys.refresh_memory();

    let cpu_usage = sys.global_cpu_info().cpu_usage();
    let memory_used = sys.used_memory() / 1024 / 1024; // MB
    let memory_total = sys.total_memory() / 1024 / 1024; // MB

    // Map each CPU/thread into our serializable structure
    let cores = sys
        .cpus()
        .iter()
        .map(|cpu| CpuCoreData {
            name: cpu.name().to_string(),
            cpu_usage: cpu.cpu_usage(),
        })
        .collect();

    SystemData {
        cpu_usage,
        memory_used,
        memory_total,
        cores,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_system_stats])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
