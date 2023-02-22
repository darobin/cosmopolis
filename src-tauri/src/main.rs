
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;

#[derive(Clone, serde::Serialize)]
struct Payload {
  args: Vec<String>,
  cwd: String,
}


fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
        println!("{}, {argv:?}, {cwd}", app.package_info().name);
        app.emit_all("single-instance", Payload { args: argv, cwd }).unwrap();
    }))
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![welcome])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// remove this later
#[tauri::command]
fn welcome(name: &str) -> String {
    format!("Welcome to {name}!")
}