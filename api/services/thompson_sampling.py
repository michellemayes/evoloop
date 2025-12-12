import random
from typing import List, Tuple
import hashlib


class ThompsonSampler:
    @staticmethod
    def sample_beta(alpha: float, beta: float) -> float:
        return random.betavariate(alpha, beta)

    @staticmethod
    def select_variant(
        variants: List[Tuple[str, float, float]],
        visitor_id: str = None,
    ) -> str:
        if not variants:
            raise ValueError("No variants to select from")

        if visitor_id:
            seed = int(hashlib.md5(visitor_id.encode()).hexdigest()[:8], 16)
            random.seed(seed)

        best_variant = None
        best_sample = -1

        for variant_id, alpha, beta in variants:
            sample = ThompsonSampler.sample_beta(alpha, beta)
            if sample > best_sample:
                best_sample = sample
                best_variant = variant_id

        random.seed()
        return best_variant

    @staticmethod
    def calculate_prob_best(
        variants: List[Tuple[str, float, float]],
        num_simulations: int = 10000,
    ) -> dict:
        if not variants:
            return {}

        win_counts = {v[0]: 0 for v in variants}

        for _ in range(num_simulations):
            samples = [
                (v[0], ThompsonSampler.sample_beta(v[1], v[2]))
                for v in variants
            ]
            winner = max(samples, key=lambda x: x[1])[0]
            win_counts[winner] += 1

        return {v: count / num_simulations for v, count in win_counts.items()}
