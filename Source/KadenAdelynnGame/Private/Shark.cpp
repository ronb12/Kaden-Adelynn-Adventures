#include "Shark.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "Kismet/GameplayStatics.h"
#include "PlayerCharacter.h"
#include "KadenAdelynnGameMode.h"

AShark::AShark()
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
	CollisionComponent->SetSphereRadius(100.0f);
	CollisionComponent->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	CollisionComponent->SetCollisionObjectType(ECollisionChannel::ECC_WorldDynamic);
	CollisionComponent->SetCollisionResponseToAllChannels(ECollisionResponse::ECR_Ignore);
	CollisionComponent->SetCollisionResponseToChannel(ECollisionChannel::ECC_Pawn, ECollisionResponse::ECR_Overlap);

	// Bind overlap event
	CollisionComponent->OnComponentBeginOverlap.AddDynamic(this, &AShark::OnOverlapBegin);

	// Initialize movement variables
	MovementTimer = 0.0f;
	DirectionChangeInterval = 3.0f;
}

void AShark::BeginPlay()
{
	Super::BeginPlay();
	
	// Set initial target location
	SetNewTargetLocation();
}

void AShark::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	// Update movement timer
	MovementTimer += DeltaTime;

	// Change direction periodically
	if (MovementTimer >= DirectionChangeInterval)
	{
		SetNewTargetLocation();
		MovementTimer = 0.0f;
	}

	// Move towards target location
	FVector CurrentLocation = GetActorLocation();
	FVector Direction = (TargetLocation - CurrentLocation).GetSafeNormal();
	FVector NewLocation = CurrentLocation + Direction * MovementSpeed * DeltaTime;
	SetActorLocation(NewLocation);

	// Rotate towards movement direction
	if (!Direction.IsNearlyZero())
	{
		FRotator TargetRotation = Direction.Rotation();
		FRotator CurrentRotation = GetActorRotation();
		FRotator NewRotation = FMath::RInterpTo(CurrentRotation, TargetRotation, DeltaTime, RotationSpeed);
		SetActorRotation(NewRotation);
	}

	// Check if shark is too far from player and destroy if so
	if (APlayerCharacter* Player = Cast<APlayerCharacter>(UGameplayStatics::GetPlayerPawn(GetWorld(), 0)))
	{
		float DistanceToPlayer = FVector::Dist(GetActorLocation(), Player->GetActorLocation());
		if (DistanceToPlayer > 2000.0f)
		{
			Destroy();
		}
	}
}

void AShark::SetNewTargetLocation()
{
	// Generate random target location within bounds
	float X = FMath::RandRange(-1000.0f, 1000.0f);
	float Y = FMath::RandRange(-1000.0f, 1000.0f);
	float Z = FMath::RandRange(100.0f, 500.0f);
	TargetLocation = FVector(X, Y, Z);
}

void AShark::OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	// Check if the overlapping actor is the player
	if (APlayerCharacter* Player = Cast<APlayerCharacter>(OtherActor))
	{
		OnHitPlayer();
	}
}

void AShark::OnHitPlayer()
{
	// Damage the player
	if (APlayerCharacter* Player = Cast<APlayerCharacter>(UGameplayStatics::GetPlayerPawn(GetWorld(), 0)))
	{
		// TODO: Add damage function to player character
		// Player->TakeDamage(DamageAmount);
	}

	// Play hit sound
	// TODO: Add shark hit sound effect

	// Call Blueprint event
	OnHitPlayer_BP();

	// Destroy the shark
	Destroy();
} 