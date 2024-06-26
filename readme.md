# E-ticaret Sipariş Yönetim Sistemi

Bu projede bir e-ticaret uygulamasının sepet ve sipariş ağırlıklı backend kısımları rest api olarak oluşturulmuştur. Api de Redis, Docker, RabbitMQ gibi teknolojiler kullanılmıştır.

## Başlangıç

### Gereksinimler

- Docker
- Node.Js

### Docker ile ayağa kaldırma

Öncelikle docker ile projeyi build ediyoruz.

```
docker compose build
```

Ardından projeyi konteynır üzerinde çalıştırmak için aşağıdaki komutu yzıyoruz.

```
docker compose up
```

### Seedleri Çalıştırmak

Örnek verileri veritabanına yüklemek için aşağıdaki kodu çalıştırmanız yeterlidir. Bu işlemi projeyi docker ile ayağa kaldırdıkdan sonra yapınız.

```
npx prisma db seed
```

Halihazırda bir veriniz var ise ve veri tabanını sıfırlayıp seedleri yüklemek istiyorsanız aşağıdaki komutu çalıştırın

```
npx prisma migrate reset
```

### RabbitMQ Uİ

RabbitMQ ui a [http://localhost:15672 ]() linkinden ulaşabilirsin.

### SWAGGER

Endpointleri görmek için Swagger ui a [http://localhost:3000/api/docs]() dan ulaşabilirsin.
