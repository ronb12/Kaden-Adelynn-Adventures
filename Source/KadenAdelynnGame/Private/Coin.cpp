#include "Coin.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "Kismet/GameplayStatics.h"
#include "KadenAdelynnGameMode.h"
#include "PlayerCharacter.h"

ACoin::ACoin()
{
	PrimaryActorTick.bCanEverTick = true;

	// Create root component
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("RootComponent"));

	// Create mesh component
	MeshComponent = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("MeshComponent"));
	MeshComponent->SetupAttachment(RootComponent);
	MeshComponent->SetCollisionEnabled(ECollisionEnabled::NoCollision);

	// Create collision component
	CollisionComponent = CreateDefaultSubobject<USphereComponent>(TEXT("CollisionComponent"));
	CollisionComponent->SetupAttachment(RootComponent);
	CollisionComponent->SetSphereRadius(50.0f);
	CollisionComponent->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	CollisionComponent->SetCollisionObjectType(ECollisionChannel::ECC_WorldDynamic);
	CollisionComponent->SetCollisionResponseToAllChannels(ECollisionResponse::ECR_Ignore);
	CollisionComponent->SetCollisionResponseToChannel(ECollisionChannel::ECC_Pawn, ECollisionResponse::ECR_Overlap);

	// Bind overlap event
	CollisionComponent->OnComponentBeginOverlap.AddDynamic(this, &ACoin::OnOverlapBegin);

	// Initialize animation variables
	BobTime = 0.0f;
}

void ACoin::BeginPlay()
{
	Super::BeginPlay();
	
	InitialZ = GetActorLocation().Z;
}

void ACoin::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	// Rotate the coin
	FRotator CurrentRotation = GetActorRotation();
	CurrentRotation.Yaw += RotationSpeed * DeltaTime;
	SetActorRotation(CurrentRotation);

	// Bob up and down
	BobTime += DeltaTime * BobSpeed;
	float NewZ = InitialZ + FMath::Sin(BobTime) * BobHeight;
	FVector CurrentLocation = GetActorLocation();
	CurrentLocation.Z = NewZ;
	SetActorLocation(CurrentLocation);
}

void ACoin::OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	// Check if the overlapping actor is the player
	if (APlayerCharacter* Player = Cast<APlayerCharacter>(OtherActor))
	{
		OnCollected();
	}
}

void ACoin::OnCollected()
{
	// Add score to game mode
	if (AKadenAdelynnGameMode* GameMode = Cast<AKadenAdelynnGameMode>(UGameplayStatics::GetGameMode(GetWorld())))
	{
		GameMode->AddScore(PointValue);
	}

	// Play collection sound
	// TODO: Add coin collection sound effect

	// Call Blueprint event
	OnCollected_BP();

	// Destroy the coin
	Destroy();
} 