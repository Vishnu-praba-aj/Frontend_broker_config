import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { mapMetadataKeys } from './metadata-mapper';

@Injectable({
  providedIn: 'root',
})

export class BrokerConfigService {
  private baseUrl = 'http://localhost:8000/api'
  private dummyBrokers = [
    { broker_code: 'B001', broker_name: 'BNP' },
    { broker_code: 'B002', broker_name: 'BNA' },
  ];
  private dummyFields = [
      {
        custom_field: 'field1',
        document_label: 'Field 1',
        value: 'Sample Value',
        metadata: mapMetadataKeys({ confidence: 0.95, source: 'OCR' }),
      },
      {
        custom_field: 'field2',
        document_label: 'Field 2',
        value: 'Sample Value',
        metadata: mapMetadataKeys({ confidence: 0.88, source: 'Manual' }),
      },
      {
        custom_field: 'unique_identifier',
        document_label: 'Field 3',
        value: 'Sample Value',
        metadata: mapMetadataKeys({ confidence: 0.88, source: 'Manual' }),
      },
    ];

  constructor(private http: HttpClient) {}

  getBrokers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/broker/config/brokers`).pipe(
      tap(res => console.log('Response [getBrokers]:', res)),
      catchError(() => of({ broker: this.dummyBrokers }))
    );
  }

  submitFinalConfiguration(payload: any): Observable<any> {
    console.log('Request [submitFinalConfiguration]:', payload);
    return this.http.post(`${this.baseUrl}/broker/config/insert_config `, payload).pipe(
      tap(res => console.log('Response [submitFinalConfiguration]:', res))
    );
  }

  submitBrokerConfiguration(formData: FormData): Observable<any> {
    console.log('Request [submitBrokerConfiguration]:', formData);
    return this.http.post(`${this.baseUrl}/broker/template/extract_fields`, formData).pipe(
      map((rawResponse: any) => {
        const mappedResponse = {
          ...rawResponse,
          response: {
            rows: rawResponse.response.rows.map((row: any) => ({
              ...row,
              fields: row.fields.map((field: any) => ({
                ...field,
                metadata: mapMetadataKeys(field.metadata),
              })),
            })),
          },
        };
        return mappedResponse;
      }),
      tap(mappedRes => console.log('Mapped Response [submitBrokerConfiguration]:', mappedRes)),
      catchError(err => {
        console.warn('Error [getTemplateData], using dummy:', err);
        return of({
          version_no: '1',
          response: {
            rows: [{ fields: this.dummyFields }],
          },
        });
      })
    );
    
  }

  setUniqueIdentifier(payload: any): Observable<any> {
    console.log('Request [setUniqueIdentifier]:', payload);
    return this.http.post(`${this.baseUrl}/broker/template/extract_unique_id`, payload).pipe(
      map((rawResponse: any) => {
        const mappedResponse = {
          ...rawResponse,
          response: {
            rows: rawResponse.response.rows.map((row: any) => ({
              ...row,
              fields: row.fields.map((field: any) => ({
                ...field,
                metadata: mapMetadataKeys(field.metadata),
              })),
            })),
          },
        };
        return mappedResponse;
      }),
      tap(mappedRes => console.log('Mapped Response [setUniqueIdentifier]:', mappedRes)),
      catchError(err => {
        console.warn('Error [getTemplateData], using dummy:', err);
        return of({
          version_no: '1',
          response: {
            rows: [{ fields: this.dummyFields }],
          },
        });
      })
    );
    
  }

  validateUniqueIdentifier(payload: any): Observable<any> {
    console.log('Request [validateUniqueIdentifier]:', payload);
    return this.http.post(`${this.baseUrl}/broker/config/unique_id_exists`, payload).pipe(
      tap(res => console.log('Response [validateUniqueIdentifier]:', res))
    ,catchError(err => {
        console.warn('Error [setuniqueidentifier], using dummy:', err);
        return of({
          can_proceed:true
        });
      }) );
  }

  continueChat(payload: any): Observable<any> {
    console.log('Request [continueChat]:', payload);
    return this.http.post(`${this.baseUrl}/broker/template/continue_chat`, payload).pipe(
      map((rawResponse: any) => {
        const mappedResponse = {
          ...rawResponse,
          response: {
            rows: rawResponse.response.rows.map((row: any) => ({
              ...row,
              fields: row.fields.map((field: any) => ({
                ...field,
                metadata: mapMetadataKeys(field.metadata),
              })),
            })),
          },
        };
        return mappedResponse;
      }),
      tap(mappedRes => console.log('Mapped Response [continueChat]:', mappedRes))
    );
  }
}
