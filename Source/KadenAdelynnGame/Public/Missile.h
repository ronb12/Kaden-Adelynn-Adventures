#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "Missile.generated.h"

UCLASS()
class KADENADELYNNGAME_API AMissile : public AActor
{
	GENERATED_BODY()
	
public:	
	AMissile();

protected:
	virtual void BeginPlay() override;

public:	
	virtual void Tick(float DeltaTime) override;

	// Components
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UStaticMeshComponent* MeshComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	USphereComponent* CollisionComponent;

	// Properties
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Missile Properties")
	float Speed = 1000.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Missile Properties")
	float Damage = 1.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Missile Properties")
	float Lifetime = 5.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Missile Properties")
	bool bAutoAim = false;

	// Events
	UFUNCTION(BlueprintCallable, Category = "Missile Events")
	void OnHitTarget();

	UFUNCTION(BlueprintImplementableEvent, Category = "Missile Events")
	void OnHitTarget_BP();

	// Overlap events
	UFUNCTION()
	void OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

private:
	// Movement variables
	FVector Direction;
	float LifeTimer;

	// Auto-aim variables
	AActor* TargetActor;
	float AutoAimRange = 500.0f;
	float AutoAimStrength = 0.1f;

	// Helper functions
	void FindTarget();
	void UpdateDirection();
}; 