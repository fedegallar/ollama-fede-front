import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from 'src/app/core/services/chat.service';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  public dataTextGroup: {message: string, owner: string}[] = [];
  public textData!: string;
  public writting: boolean = false;
  public chatService = inject(ChatService);
  public lastChunk = '';

  sendData() {
    this.dataTextGroup.push({message: this.textData, owner: 'me'});
    this.dataTextGroup.push({message: '', owner: 'pc'}); // Placeholder for the bot's response
    this.writting = true; // Indicate that the bot is responding

    this.chatService.generateResponse(this.textData).subscribe({
      next: (message) => this.setData(message),
      error: (err) => {
        console.error('Error:', err);
        this.writting = false;
      },
      complete: () => this.writting = false
    });
  }

  setData(chunkMessage: string) {
    if (chunkMessage !== this.lastChunk) {
      this.lastChunk = chunkMessage;
      this.dataTextGroup[this.dataTextGroup.length - 1].message += ` ${chunkMessage}`;
    }
  }

}
