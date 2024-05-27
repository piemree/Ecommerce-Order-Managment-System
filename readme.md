# E-ticaret Sipariş Yönetim Sistemi

Bu projede bir e-ticaret uygulamasının sepet ve sipariş ağırlıklı backend kısımları rest api olarak oluşturulmuştur.

## Başlangıç

### Gereksinimler

- Docker
- Node.Js

### Docker ile ayağa kaldırma

Öncelikle docker ile projeyi build ediyoruz.

```
docker compose build
```

Ardından projeyi konteynır üzerinde çalıştırmak için aşşağıdaki komutu yzıyoruz.

```
docker compose up
```

### Seedleri Çalıştırmak

Örnek verileri veritabanına yüklemek için aşşağıdaki kodu çalıştırmanız yeterlidir. Bu işlemi projeyi docker ile ayağa kaldırdıkdan sonra yapınız.

```
npx prisma db seed
```
