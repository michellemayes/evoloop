import pytest
from services.thompson_sampling import ThompsonSampler


class TestThompsonSampler:
    def test_sample_beta_returns_value_in_range(self):
        for _ in range(100):
            sample = ThompsonSampler.sample_beta(1.0, 1.0)
            assert 0 <= sample <= 1

    def test_select_variant_returns_valid_id(self):
        variants = [
            ("var1", 10, 90),
            ("var2", 50, 50),
            ("var3", 90, 10),
        ]
        selected = ThompsonSampler.select_variant(variants)
        assert selected in ["var1", "var2", "var3"]

    def test_select_variant_consistent_for_visitor(self):
        variants = [
            ("var1", 10, 10),
            ("var2", 10, 10),
            ("var3", 10, 10),
        ]
        results = set()
        for _ in range(10):
            selected = ThompsonSampler.select_variant(variants, "visitor123")
            results.add(selected)
        assert len(results) == 1

    def test_select_variant_different_visitors_can_differ(self):
        variants = [
            ("var1", 10, 10),
            ("var2", 10, 10),
            ("var3", 10, 10),
        ]
        results = set()
        for i in range(100):
            selected = ThompsonSampler.select_variant(variants, f"visitor{i}")
            results.add(selected)
        assert len(results) > 1

    def test_high_alpha_variant_selected_more_often(self):
        variants = [
            ("loser", 1, 100),
            ("winner", 100, 1),
        ]
        winner_count = 0
        for _ in range(1000):
            selected = ThompsonSampler.select_variant(variants)
            if selected == "winner":
                winner_count += 1
        assert winner_count > 900

    def test_calculate_prob_best(self):
        variants = [
            ("var1", 10, 90),
            ("var2", 50, 50),
            ("var3", 90, 10),
        ]
        probs = ThompsonSampler.calculate_prob_best(variants)
        assert len(probs) == 3
        assert sum(probs.values()) == pytest.approx(1.0, abs=0.01)
        assert probs["var3"] > probs["var2"] > probs["var1"]

    def test_select_variant_raises_on_empty(self):
        with pytest.raises(ValueError):
            ThompsonSampler.select_variant([])

    def test_calculate_prob_best_empty_returns_empty(self):
        probs = ThompsonSampler.calculate_prob_best([])
        assert probs == {}
