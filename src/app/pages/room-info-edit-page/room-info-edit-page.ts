import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-room-info-edit-page',
  imports: [CommonModule, ReactiveFormsModule,EditorModule],
  templateUrl: './room-info-edit-page.html',
  styleUrl: './room-info-edit-page.css'
})
export class RoomInfoEditPage implements OnInit {
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