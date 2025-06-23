#include "PowerUp.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "Kismet/GameplayStatics.h"
#include "PlayerCharacter.h"
#include "KadenAdelynnGameMode.h"

APowerUp::APowerUp()
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
	CollisionComponent->SetSphereRadius(60.0f);
	CollisionComponent->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	CollisionComponent->SetCollisionObjectType(ECollisionChannel::ECC_WorldDynamic);
	CollisionComponent->SetCollisionResponseToAllChannels(ECollisionResponse::ECR_Ignore);
	CollisionComponent->SetCollisionResponseToChannel(ECollisionChannel::ECC_Pawn, ECollisionResponse::ECR_Overlap);

	// Bind overlap event
	CollisionComponent->OnComponentBeginOverlap.AddDynamic(this, &APowerUp::OnOverlapBegin);

	// Initialize animation variables
	BobTime = 0.0f;
}

void APowerUp::BeginPlay()
{
	Super::BeginPlay();
	
	InitialZ = GetActorLocation().Z;
}

void APowerUp::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	// Rotate the power-up
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

void APowerUp::OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	// Check if the overlapping actor is the player
	if (APlayerCharacter* Player = Cast<APlayerCharacter>(OtherActor))
	{
		OnCollected();
	}
}

void APowerUp::OnCollected()
{
	// Apply power-up effect to player
	if (APlayerCharacter* Player = Cast<APlayerCharacter>(UGameplayStatics::GetPlayerPawn(GetWorld(), 0)))
	{
		switch (PowerUpType)
		{
		case EPowerUpType::SpeedBoost:
			// TODO: Apply speed boost to player
			// Player->ApplySpeedBoost(Duration);
			break;
			
		case EPowerUpType::Shield:
			// TODO: Apply shield to player
			// Player->ApplyShield(Duration);
			break;
			
		case EPowerUpType::DoublePoints:
			// TODO: Apply double points to game mode
			// GameMode->EnableDoublePoints(Duration);
			break;
			
		case EPowerUpType::SlowMotion:
			// TODO: Apply slow motion to world
			// UGameplayStatics::SetGlobalTimeDilation(GetWorld(), 0.5f);
			break;
			
		case EPowerUpType::Missile:
			// TODO: Give player missile ability
			// Player->EnableMissileAbility(Duration);
			break;
		}
	}

	// Play collection sound
	// TODO: Add power-up collection sound effect

	// Call Blueprint event
	OnCollected_BP();

	// Destroy the power-up
	Destroy();
} 