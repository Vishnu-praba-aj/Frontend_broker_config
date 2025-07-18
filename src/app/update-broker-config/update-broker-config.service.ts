import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { mapMetadataKeys } from './metadata-mapper';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BrokerConfigService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getBrokers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/broker/config/brokers`).pipe(
      tap(res => console.log('Response [getBrokers]:', res)),
      catchError(err => {
        console.warn('Error', err);
        return throwError(() => err); 
      })
    );
  }

  getTemplateCount(brokerCode: string): Observable<any> {
    const params = { broker_code: brokerCode };
    return this.http.get(`${this.baseUrl}/broker/config/template_info`, { params }).pipe(
      tap(res => console.log('Response [getTemplateCount]:', res)),
      catchError(err => {
        console.warn('Error', err);
        return throwError(() => err); 
      })
    );
  }

  getTemplateData(brokerCode: string, templateNo: number): Observable<any> {
    const params = {
      broker_code: brokerCode,
      broker_template_no: templateNo.toString(),
    };

    return this.http.get(`${this.baseUrl}/broker/config/get_config`, { params }).pipe(
      map((rawResponse: any) => ({
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
      })),
      tap(mappedRes => console.log('Mapped Response [getTemplateData]:', mappedRes)),
      catchError(err => {
        console.warn('Error', err);
        return throwError(() => err); 
      })
    );
  }

  submitFinalConfiguration(payload: any): Observable<any> {
    console.log('Request [submitFinalConfiguration]:', payload);
    return this.http.post(`${this.baseUrl}/broker/config/update_config`, payload).pipe(
      tap(res => console.log('Response [submitFinalConfiguration]:', res))
    );
  }

  submitBrokerConfiguration(formData: FormData): Observable<any> {
    console.log('Request [submitBrokerConfiguration]:', formData);
    return this.http.post(`${this.baseUrl}/broker/template/extract_fields`, formData).pipe(
      map((rawResponse: any) => ({
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
      })),
      tap(mappedRes => console.log('Mapped Response [submitBrokerConfiguration]:', mappedRes)),
    catchError(err => {
        console.warn('Error', err);
        return throwError(() => err); 
      })
    );
  }

  setUniqueIdentifier(payload: any): Observable<any> {
    console.log('Request [setUniqueIdentifier]:', payload);
    return this.http.post(`${this.baseUrl}/broker/template/extract_unique_id`, payload).pipe(
      map((rawResponse: any) => ({
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
      })),
      tap(mappedRes => console.log('Mapped Response [setUniqueIdentifier]:', mappedRes)),
    
    catchError(err => {
        console.warn('Error [setuniqueidentifier], using dummy:', err);
        return throwError(() => err); 
      }) );
  }

  validateUniqueIdentifier(payload: any): Observable<any> {
    console.log('Request [validateUniqueIdentifier]:', payload);
    return this.http.post(`${this.baseUrl}/broker/config/unique_id_exists`, payload).pipe(
      tap(res => console.log('Response [validateUniqueIdentifier]:', res))
    ,catchError(err => {
        console.warn('Error', err);
        return throwError(() => err); 
      }) );
  }

  continueChat(payload: any): Observable<any> {
    console.log('Request [continueChat]:', payload);
    return this.http.post(`${this.baseUrl}/broker/template/continue_chat`, payload).pipe(
      map((rawResponse: any) => ({
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
      })),
      tap(mappedRes => console.log('Mapped Response [continueChat]:', mappedRes))
    );
  }
}
