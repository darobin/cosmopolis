
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![welcome])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn welcome(name: &str) -> String {
    format!("Welcome to {name}!")
}
