#include "Missile.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Shark.h"
#include "Engine/World.h"

AMissile::AMissile()
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
	CollisionComponent->SetSphereRadius(30.0f);
	CollisionComponent->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	CollisionComponent->SetCollisionObjectType(ECollisionChannel::ECC_WorldDynamic);
	CollisionComponent->SetCollisionResponseToAllChannels(ECollisionResponse::ECR_Ignore);
	CollisionComponent->SetCollisionResponseToChannel(ECollisionChannel::ECC_WorldDynamic, ECollisionResponse::ECR_Overlap);

	// Bind overlap event
	CollisionComponent->OnComponentBeginOverlap.AddDynamic(this, &AMissile::OnOverlapBegin);

	// Initialize variables
	LifeTimer = 0.0f;
	TargetActor = nullptr;
	Direction = FVector::ForwardVector;
}

void AMissile::BeginPlay()
{
	Super::BeginPlay();
	
	// Set initial direction based on spawn rotation
	Direction = GetActorForwardVector();

	// Find target if auto-aim is enabled
	if (bAutoAim)
	{
		FindTarget();
	}
}

void AMissile::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	// Update lifetime
	LifeTimer += DeltaTime;
	if (LifeTimer >= Lifetime)
	{
		Destroy();
		return;
	}

	// Update direction if auto-aiming
	if (bAutoAim && TargetActor)
	{
		UpdateDirection();
	}

	// Move missile
	FVector NewLocation = GetActorLocation() + Direction * Speed * DeltaTime;
	SetActorLocation(NewLocation);

	// Rotate missile to face movement direction
	if (!Direction.IsNearlyZero())
	{
		FRotator TargetRotation = Direction.Rotation();
		SetActorRotation(TargetRotation);
	}
}

void AMissile::FindTarget()
{
	// Find all sharks in the world
	TArray<AActor*> FoundActors;
	UGameplayStatics::GetAllActorsOfClass(GetWorld(), AShark::StaticClass(), FoundActors);

	float ClosestDistance = AutoAimRange;
	TargetActor = nullptr;

	for (AActor* Actor : FoundActors)
	{
		float Distance = FVector::Dist(GetActorLocation(), Actor->GetActorLocation());
		if (Distance < ClosestDistance)
		{
			ClosestDistance = Distance;
			TargetActor = Actor;
		}
	}
}

void AMissile::UpdateDirection()
{
	if (!TargetActor)
		return;

	FVector ToTarget = (TargetActor->GetActorLocation() - GetActorLocation()).GetSafeNormal();
	Direction = FMath::Lerp(Direction, ToTarget, AutoAimStrength);
	Direction.Normalize();
}

void AMissile::OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	// Check if we hit a shark
	if (AShark* Shark = Cast<AShark>(OtherActor))
	{
		OnHitTarget();
	}
}

void AMissile::OnHitTarget()
{
	// Play explosion sound
	// TODO: Add explosion sound effect

	// Spawn explosion effect
	// TODO: Add explosion particle effect

	// Call Blueprint event
	OnHitTarget_BP();

	// Destroy the missile
	Destroy();
} 