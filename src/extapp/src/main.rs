use std::convert::TryInto;
use std::io::{self, Read, Write, BufRead, BufReader};
use std::os::unix::net::UnixStream;
use std::fs::OpenOptions;
use std::path::Path;
use std::str;
use std::env;
use std::thread;

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

#[derive(Serialize, Deserialize)]
struct JsMessage<'a> {
    r#type: &'a str,
    data: Value,
}

struct NativeApp {
    socket: UnixStream
}

impl NativeApp {
    fn send_message(&mut self, buf: &[u8]) {
        let js_msg = [buf, &DELIMITER].concat();
        // _log(&js_msg);
        self.socket.write_all(&js_msg).unwrap();
    }
}

fn read_stdin(app: &mut NativeApp) {
    let stdin = io::stdin();
    let mut stdin = stdin.lock();

    let mut disconnect = false;
    let mut len_buf = [0; 4];
    let mut content = vec![0; 1024 * 1024]; // webextension limit 1M
    while !disconnect {
        stdin.read_exact(&mut len_buf).unwrap();
        let len = NativeEndian::read_u32(&len_buf).try_into().unwrap();
        if len == 0 {
            disconnect = true;
        } else {
            stdin.read_exact(&mut content[..len]).unwrap();
            app.send_message(&content[..len]);
        }
    }
}


fn write_stdout(buf: &[u8]) {
    let mut len_buf = [0; 4];
    NativeEndian::write_u32(&mut len_buf, buf.len().try_into().unwrap());
    let content = [&len_buf, buf].concat();
    // _log(&content);
    io::stdout().write_all(&content).unwrap();
    io::stdout().flush().unwrap();
}

fn read_native_message(app: &mut NativeApp) {
    let mut disconnect = false;
    let mut stream = BufReader::new(&mut app.socket);
    while !disconnect {
        let mut buf = vec![];
        let len = stream.read_until(DELIMITER[0], &mut buf).unwrap();
        if len == 0 {
            disconnect = true;
        } else {
            write_stdout(&buf[..buf.len() - 1]);
        }
    }
}

fn main() {
    let socket = UnixStream::connect(get_socket_path()).unwrap();
    let socket2 = socket.try_clone().expect("Couldn't clone socket");
    let mut app = NativeApp { socket };
    let mut app2 = NativeApp { socket: socket2 };
    let msg: JsMessage = JsMessage { r#type: "connected", data: Value::String(String::new()) };
    write_stdout(serde_json::to_string(&msg).unwrap().as_bytes());

    let thr1 = thread::spawn(move || read_stdin(&mut app));
    let thr2 = thread::spawn(move || read_native_message(&mut app2));
    thr1.join().expect("read stdin thread failed");
    thr2.join().expect("read socket thread failed");
}
