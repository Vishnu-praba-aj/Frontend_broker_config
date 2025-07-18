import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BrokerConfigService } from './broker-config.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Broker {
  broker_code: string;
  broker_name: string;
}

interface FieldMetadata {
  [key: string]: any;
}

interface Field {
  custom_field: string;
  document_label: string;
  value: string;
  metadata: FieldMetadata;
}

@Component({
  selector: 'app-new-broker-config',
  templateUrl: './new-broker-config.html',
  styleUrls: ['./new-broker-config.css'],

  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
})
export class NewBrokerConfig implements OnInit {
  brokers: Broker[] = [];
  isUploading: boolean = false;
  selectedBrokerCode: string = '';
  documentFile: File | null = null;
  customFieldFile: File | null = null;
  prompt: string = '';
  selectedFileName: string = '';
  selectedFieldsFileName: string = '';
  responseData: Field[] = [];
  isEditing: boolean = false;
  sessionId: string = '';
  expandedCardIndex: number = -1;
  backupFields: Field[] = [];
  selectedIdentifierField: string = '';
  newIdentifierFieldName: string = '';
  optionalPhrase: string = '';
  identifierSet: boolean = false;
  promptHistory: { from: 'user' | 'bot'; text: string }[] = [];
  initialPrompt: string = '';
  uniqueIdentifierField: any = null;
  isIdentifierExpanded: boolean = false;
  isEditingIdentifier: boolean = false;
  originalUniqueIdentifierField: Field | null = null;
  isValidating:boolean=false;

  constructor(
    private fb: FormBuilder,
    private brokerService: BrokerConfigService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchBrokers();
  }

  fetchBrokers() {
    this.brokerService.getBrokers().subscribe({
      next: (data) => {
        this.brokers = data.broker;
      },
      error: (err) => {
        this.showError(
          err.error?.message || 'Failed to fetch brokers. Please try again.'
        );
      },
    });
  }

  onBrokerChange(code: string) {
    this.selectedBrokerCode = code;
    this.responseData = [];
    this.isIdentifierExpanded = false;
    this.uniqueIdentifierField=null;
    this.identifierSet=false;
    this.promptHistory=[];
    this.documentFile= null;
    this.customFieldFile=null;
    this.selectedFileName ='';
    this.selectedFieldsFileName= '';

  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.documentFile = file || null;
    this.selectedFileName = file ? file.name : '';
  }

  onFieldsSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.customFieldFile = file || null;
    this.selectedFieldsFileName = file ? file.name : '';
  }

  canAdd(): boolean {
    return !!(
      this.selectedBrokerCode &&
      this.documentFile &&
      this.customFieldFile
    );
  }

  canReset(): boolean {
    return (
      this.selectedBrokerCode !== '' ||
      this.documentFile !== null ||
      this.customFieldFile !== null ||
      this.prompt.trim().length > 0 ||
      this.responseData.length > 0
    );
  }
  keyvalueCompare = (a: any, b: any): number => {
    return a.key.localeCompare(b.key);
  };

  trackByKey(index: number, item: any): string {
    return item.key;
  }

  getMetadataValue(field: any, key: any): any {
    return field.metadata[key as string];
  }

  setMetadataValue(field: any, key: any, value: any): void {
    field.metadata[key as string] = value;
  }

  onAdd() {
    this.isUploading = true;
    this.responseData = [];
    this.uniqueIdentifierField = null;
    this.identifierSet=false;

    const formData = new FormData();
    if (this.documentFile) formData.append('doc', this.documentFile);
    if (this.customFieldFile)
      formData.append('custom_fields', this.customFieldFile);
    if (this.initialPrompt) formData.append('user_prompt', this.initialPrompt);

    this.brokerService.submitBrokerConfiguration(formData).subscribe({
      next: (res) => {
        this.sessionId = res.session_id;
        this.responseData = res.response.rows[0].fields;
        this.expandedCardIndex = -1;
        this.isUploading = false;
      },
      error: (err) => {
        this.snackBar.open('Failed to upload files.', 'Close', {
          panelClass: ['snack-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isUploading = false;
      },
    });
  }

  onPromptSend() {
    if (!this.prompt.trim()) return;

    if (!this.sessionId) {
      this.initialPrompt = this.initialPrompt + ' ' + this.prompt;
      this.promptHistory.push({ from: 'user', text: this.prompt });
      this.promptHistory.push({
        from: 'bot',
        text: 'Now click Upload to proceed.',
      });
    } else {
      this.promptHistory.push({ from: 'user', text: this.prompt });
      this.promptHistory.push({
        from: 'bot',
        text: 'Processing...',
      });
      this.callFollowUpAPI(this.sessionId, this.prompt);
    }

    this.prompt = '';
    setTimeout(() => {
      const chatBox = document.querySelector('.chat-prompt-box');
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }, 30);
  }

  callFollowUpAPI(sessionId: string, prompt: string) {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('prompt', "In the previous response "+prompt);
    

    this.brokerService.continueChat(formData).subscribe({
      next: (response: any) => {
        this.responseData = response.response.rows[0].fields;
        this.promptHistory.push({
          from: 'bot',
          text: 'Fields are updated. Please look at the extracted data.',
        });
      },
      error: (err) => {
        this.snackBar.open('Failed to update via chat.', 'Close', {
          panelClass: ['snack-error'],
          horizontalPosition: 'center',
           verticalPosition: 'top',
        });
      },
    });
  }

  toggleMetadata(index: number) {
    this.expandedCardIndex = this.expandedCardIndex === index ? -1 : index;
  }
  getMetadataEntries(metadata: { [key: string]: any }) {
    return Object.entries(metadata);
  }

  onIdentifierChange(value: string) {
    this.newIdentifierFieldName = '';
    this.optionalPhrase = '';
  }
  getFilteredDocumentLabels(): Field[] {
    return this.responseData.filter(
      (f) => f.document_label && f.document_label.trim().length > 0
    );
  }

  addCustomUniqueIdentifier() {
  if (!this.newIdentifierFieldName.trim()) {
    alert('Please enter a field name.');
    return;
  }

  const payload = {
    session_id: this.sessionId,
    broker_code: this.selectedBrokerCode,
    unique_id: this.newIdentifierFieldName,
    message: this.optionalPhrase || '',
  };
  this.isValidating=true;
  this.brokerService.setUniqueIdentifier(payload).subscribe({
    next: (res: any) => {
      const allFields: Field[] = res.response.rows[0].fields;

      const identifierField = allFields.find(
        (f) =>
          f.document_label?.trim().toLowerCase() === this.newIdentifierFieldName.trim().toLowerCase() ||
          f.custom_field?.trim().toLowerCase() === this.newIdentifierFieldName.trim().toLowerCase()
      );

      if (identifierField) {
        this.uniqueIdentifierField = {
          ...identifierField,
          custom_field: 'unique_identifier',
        };
      }

      this.responseData = allFields.filter(
        (f) =>
          f !== identifierField
      );

      this.identifierSet = true;
      this.isValidating=false;
      this.snackBar.open('Identifier added successfully!', 'Close', {
        panelClass: ['snack-success'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    },

    error: (err) => {
      this.isValidating=false;
      if (err.status === 409) {
        this.snackBar.open(
          'Identifier already exists. Please choose another field.',
          'Close',
          {
            panelClass: ['snack-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          }
        );
      } else {
        this.snackBar.open('Validation failed. Please try again.', 'Close', {
          panelClass: ['snack-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    },
  });
}


  validateExistingIdentifier() {
  const payload = {
    broker_code: this.selectedBrokerCode,
    unique_id: this.selectedIdentifierField,
  };
  this.isValidating=true;
  this.brokerService.validateUniqueIdentifier(payload).subscribe({
    next: (res: any) => {
      if (res.can_proceed) {
        
        const identifierField = this.responseData.find(
          (field) =>
            field.document_label?.trim().toLowerCase() === this.selectedIdentifierField.trim().toLowerCase() ||
            field.custom_field?.trim().toLowerCase() === this.selectedIdentifierField.trim().toLowerCase()
        );

        if (identifierField) {
          
          this.uniqueIdentifierField = {
            ...identifierField,
            custom_field: 'unique_identifier',
          };

          
          this.responseData = this.responseData.filter(f => f !== identifierField);
        }

        this.identifierSet = true;
        this.isValidating=false;
        this.snackBar.open('Identifier added successfully!', 'Close', {
          panelClass: ['snack-success'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      } else {
        this.isValidating=false;
        this.snackBar.open("Can't use this as unique identifier.", 'Close', {
          panelClass: ['snack-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    },

    error: (err) => {
      this.isValidating=false;
      if (err.status === 409) {
        this.snackBar.open(
          'Identifier already exists. Please choose another field.',
          'Close',
          {
            panelClass: ['snack-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          }
        );
      } else {
        this.snackBar.open('Validation failed. Please try again.', 'Close', {
          panelClass: ['snack-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    },
  });
}



  onSubmit() {
    const finalResponseData = [...this.responseData];

    if (this.uniqueIdentifierField) {
    finalResponseData.push({
      ...this.uniqueIdentifierField,
      custom_field: 'unique_identifier', 
    });
  }
    console.log(finalResponseData);

    const payload = {
      broker_code: this.selectedBrokerCode,
      response: {
        rows: [
          {
            index: 0,
            fields: finalResponseData.map((field) => ({
              custom_field: field.custom_field,
              document_label: field.document_label,
              value: field.value,
              metadata: {
                start_index_nbr: field.metadata['start-index-nbr'] ?? null,
                end_index_nbr: field.metadata['end-index-nbr'] ?? null,
                row_adder_cnt: field.metadata['row-adder-cnt'] ?? null,
                col_adder_cnt: field.metadata['col-adder-cnt'] ?? null,
                param_ref_delim_txt:
                  field.metadata['param-ref-delim-txt'] ?? null,
                param_value_pos_cd:
                  field.metadata['param-value-pos-cd'] ?? null,
                unit_price_pct_ind:
                  field.metadata['unit-price-pct-ind'] ?? null,
                param_nm_occur_ind:
                  field.metadata['param-nm-occur-ind'] ?? null,
                date_format_cd: field.metadata['date-format-cd'] ?? null,
                decimal_seperator_cd:
                  field.metadata['decimal-seperator-cd'] ?? null,
                param_def_value_txt:
                  field.metadata['param-def-value-txt'] ?? null,
                derivation_col: field.metadata['derivation-col'] ?? null,
                operations_seq: field.metadata['operations-seq'] ?? null,
                param_val_fn_txt: field.metadata['param-val-fn-txt'] ?? null,
              },
            })),
          },
        ],
      },
    };

    console.log('Submitting payload:', payload);

    this.brokerService.submitFinalConfiguration(payload).subscribe({
      next: (res) => {
        const message = res?.message || 'Configuration submitted successfully!';
        this.snackBar.open(message, 'Close', {
          panelClass: ['snack-success'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Submission failed:', err);

        const errorMessage =
          err.error?.detail ||
          err.error?.message ||
          'Failed to submit configuration.';

        this.snackBar.open(errorMessage, 'Close', {
          panelClass: ['snack-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  toggleEdit() {
    this.backupFields = JSON.parse(JSON.stringify(this.responseData));
    this.isEditing = true;
  }

  onSave() {
    this.isEditing = false;
  }

  onFormReset() {
    this.selectedBrokerCode = '';
    this.documentFile = null;
    this.customFieldFile = null;
    this.prompt = '';
    this.selectedFileName = '';
    this.selectedFieldsFileName = '';
    this.responseData = [];
    this.selectedIdentifierField = '';
    this.newIdentifierFieldName = '';
    this.optionalPhrase = '';
    this.identifierSet = false;
    this.isEditing = false;
    this.expandedCardIndex = -1;
  }

  onEditReset() {
     this.isEditing = false;
     this.responseData = JSON.parse(JSON.stringify(this.backupFields));
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      panelClass: ['snack-error'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      panelClass: ['snack-success'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  saveUniqueIdentifierEdit() {
    if (!this.uniqueIdentifierField) return;

    const payload: { [key: string]: any } = {
      broker_code: this.selectedBrokerCode,
      unique_id: this.uniqueIdentifierField.document_label,
    };

    // if (this.selectedTemplateNumber !== null && this.selectedTemplateNumber !== undefined) {
    //   payload['broker_template_no'] = this.selectedTemplateNumber;
    // }


    this.brokerService.validateUniqueIdentifier(payload).subscribe({
      next: (res: any) => {
        if (res.can_proceed) {
          this.snackBar.open(
            'Unique identifier validated successfully!',
            'Close',
            {
              panelClass: ['snack-success'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            }
          );
          this.isEditingIdentifier = false;
        } else {
          this.snackBar.open("Can't use this as unique identifier.", 'Close', {
            panelClass: ['snack-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      },
      error: (err) => {
        if (err.status === 409) {
          this.snackBar.open(
            'Identifier already exists. Please choose another field.',
            'Close',
            {
              panelClass: ['snack-error'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            }
          );
        } else {
          this.snackBar.open('Validation failed. Please try again.', 'Close', {
            panelClass: ['snack-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      },
    });
  }


  toggleIdentifierMetadata() {
    this.isIdentifierExpanded = !this.isIdentifierExpanded;
  }

  toggleIdentifierEdit() {
    this.isEditingIdentifier = true;
    this.originalUniqueIdentifierField = JSON.parse(
      JSON.stringify(this.uniqueIdentifierField)
    );
  }

  cancelIdentifierEdit() {
    if (this.originalUniqueIdentifierField) {
      this.uniqueIdentifierField = JSON.parse(
        JSON.stringify(this.originalUniqueIdentifierField)
      );
    }
    this.isEditingIdentifier = false;
  }
}
