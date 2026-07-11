import http.server
import socketserver
import os

PORT = 3000
DIR = os.path.dirname(os.path.abspath(__file__))

os.chdir(DIR)

Handler = http.server.SimpleHTTPRequestHandler

# Threading: the app requests ~100 artwork JPGs on load; a single-threaded
# TCPServer serves them one at a time and stalls the page. allow_reuse_address
# avoids "Address already in use" when restarting the dev server.
class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

with Server(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
