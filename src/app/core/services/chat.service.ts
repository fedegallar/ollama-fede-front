import { Injectable } from "@angular/core";
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) {}

  generateResponse(prompt: string): Observable<string> {
    const url = 'http://192.168.0.222:11434/api/generate';
    const body = JSON.stringify({
      model: 'llama3.2',
      stream: false,
      prompt
    });
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return new Observable<string>((observer) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
          observer.error(xhr.statusText);
        }
      };

      xhr.onprogress = () => {
        // Collect all the response text so far
        const lines = xhr.responseText.split('\n');
        
        // Iterate over each line and emit it as a response
        for (let line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                observer.next(parsed.response); // Send the message chunk
              }
              if (parsed.done) {
                observer.complete(); // Mark the observable as complete
              }
            } catch (e) {
              console.error('Failed to parse JSON:', e);
              observer.error('Failed to parse JSON');
            }
          }
        }
      };

      xhr.onload = () => observer.complete();
      xhr.onerror = () => observer.error(xhr.statusText);

      xhr.send(body);
    }); 
  }
}
