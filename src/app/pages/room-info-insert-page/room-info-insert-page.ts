import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-room-info-insert-page',
  imports: [CommonModule, ReactiveFormsModule, EditorModule],
  templateUrl: './room-info-insert-page.html',
  styleUrl: './room-info-insert-page.css',
  encapsulation: ViewEncapsulation.None
})
export class RoomInfoInsertPage implements OnInit {
  roomForm!: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.roomForm = this.fb.group({
      name: [''],
      description: [''],
      equipment: [''],
      price: [''],
      unit: ['']
    });
  }

  onSubmit(): void {
    console.log(this.roomForm.value);
    // 🔜 之後這裡改成呼叫 API，例如:
    // this.http.post('/api/rooms/create', this.roomForm.value).subscribe(...)
  }
}
