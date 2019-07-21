use std::convert::TryInto;
use std::io::{self, Read, Write};
use std::os::unix::net::UnixStream;
use std::fs::OpenOptions;
use std::path::Path;
use std::str;
use std::env;

use byteorder::{ByteOrder, NativeEndian};
use serde_json::Value;
use serde::{Serialize, Deserialize};

const DELIMITER:[u8; 1] = [12]; // node-ipc "\f"

fn get_socket_path() -> String {
    let exe_path = env::current_exe().unwrap();
    let exe_path = Path::new(&exe_path);
    // Cargo.toml name
    let filename = exe_path.file_name().unwrap();
    // node-ipc unix socket path
    format!("/tmp/app.{}", filename.to_str().unwrap())
}

fn _log(buf: &[u8]) {
    let mut file = OpenOptions::new().append(true).open("/Users/mantou/log").unwrap();
    file.write_all(format!("{:?}", buf).as_bytes()).unwrap();
    file.write_all(b"\n").unwrap();
    file.write_all(buf).unwrap();
    file.write_all(b"\n").unwrap();
}

fn write_stdout(msg: &str) {
    let mut len_buf = [0; 4];
    let msg_buf = msg.as_bytes();
    NativeEndian::write_u32(&mut len_buf, msg_buf.len().try_into().unwrap());
    let content = [&len_buf, msg_buf].concat();
    // _log(&content);
    io::stdout().write_all(&content).unwrap();
    io::stdout().write_all(b"\n").unwrap();
}

#[derive(Serialize, Deserialize)]
struct JsMessage<'a> {
    r#type: &'a str,
    data: Value,
}

struct NativeApp {
    socket: UnixStream
}

impl NativeApp {
    fn send_message(&mut self, data: &str) {
        let js_msg:JsMessage = serde_json::from_str(data).unwrap();
        let js_msg = serde_json::to_string(&js_msg).unwrap();
        let js_msg = [js_msg.as_bytes(), &DELIMITER].concat();
        // _log(&js_msg);
        self.socket.write_all(&js_msg).unwrap();
    }
}

fn main() {
    let mut app = NativeApp { socket: UnixStream::connect(get_socket_path()).unwrap() };
    write_stdout(&serde_json::to_string("connect").unwrap());

    let stdin = io::stdin();
    let mut stdin = stdin.lock();

    let mut len_buf = [0; 4];
    let mut content = vec![0; 1024 * 1024]; // webextension limit 1M
    loop {
        stdin.read_exact(&mut len_buf).unwrap();
        let len = NativeEndian::read_u32(&len_buf).try_into().unwrap();
        stdin.read_exact(&mut content[..len]).unwrap();
        app.send_message(str::from_utf8(&content[..len]).unwrap());
    }
}
